import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, User, Briefcase, Phone, Lock } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import { TextField, SelectField, Section } from '../../components/admin/FormFields.jsx';
import * as employeeService from '../../services/employeeService';
import * as officeService from '../../services/officeService';
import {
    PREFIXES, GENDERS, BLOOD_GROUPS, NATIONALITIES,
    EMPLOYMENT_TYPES, EMPLOYMENT_STATUSES,
    BUSINESS_UNITS, DEPARTMENTS, BRANCHES, SUB_BRANCHES, ROLES,
} from '../../config/employeeOptions.js';

// Keys match the backend model. Company is saved to officeId.
const emptyForm = {
    // Personal
    employeeCode: '', prefix: '', name: '', dateOfBirth: '',
    gender: '', bloodGroup: '', nationality: '',
    // Work
    email: '', dateOfJoining: '', employmentType: '', employmentStatus: '',
    officeId: '', businessUnit: '', department: '', designation: '',
    branch: '', subBranch: '',
    reportingManagerCode: '', reportingManagerId: '',
    functionalManagerCode: '', functionalManagerId: '',
    // Contact & IDs
    contactNumber: '', aadhar: '', pan: '', emergencyContact: '', personalEmail: '',
    // Login access
    password: '', role: 'user',
};

// Populated objects ({ _id, name }) -> plain id string
const toId = (v) => (v && typeof v === 'object' ? v._id : v) || '';

// ISO date -> "YYYY-MM-DD" (what <input type="date"> expects)
const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');

// Build form state from an employee record.
// Only keys in emptyForm are copied, so _id, status, photoUrl, createdAt never reach the payload.
function employeeToForm(emp) {
    const f = {};
    Object.keys(emptyForm).forEach((key) => {
        f[key] = emp[key] ?? '';
    });
    f.officeId = toId(emp.officeId);
    f.reportingManagerId = toId(emp.reportingManagerId);
    f.functionalManagerId = toId(emp.functionalManagerId);
    f.dateOfBirth = toDateInput(emp.dateOfBirth);
    f.dateOfJoining = toDateInput(emp.dateOfJoining);
    f.role = emp.role || 'user';
    f.password = ''; // never prefilled
    return f;
}

export default function EmployeeForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    const [offices, setOffices] = useState([]);
    const [employees, setEmployees] = useState([]);

    // ---- Load dropdown data (companies and managers) ----
    useEffect(() => {
        Promise.allSettled([officeService.listOffices(), employeeService.listEmployees()])
            .then(([o, e]) => {
                if (o.status === 'fulfilled') setOffices(o.value);
                if (e.status === 'fulfilled') setEmployees(e.value);
            });
    }, []);

    // ---- Load the employee when editing ----
    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;

        setLoading(true);
        employeeService
            .getEmployee(id)
            .then((emp) => {
                if (cancelled) return;
                setForm(employeeToForm(emp));
                setPhotoFile(null);
                setPhotoPreview(emp.photoUrl || null);
            })
            .catch((err) => {
                if (cancelled) return;
                setFormError(err.response?.data?.message || 'Could not load employee');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [id, isEdit]);

    // Manager options: "Name (CODE)", and an employee can't be their own manager
    const managerOptions = employees
        .filter((emp) => emp._id !== id)
        .map((emp) => ({
            value: emp._id,
            label: emp.employeeCode ? `${emp.name} (${emp.employeeCode})` : emp.name,
        }));

    // ---- Handlers ----
    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'aadhar') value = value.replace(/\D/g, '').slice(0, 12);
        if (name === 'pan') value = value.toUpperCase().slice(0, 10);
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Picking a manager also fills the manager code (still editable)
    const handleManagerChange = (idField, codeField) => (e) => {
        const managerId = e.target.value;
        const manager = employees.find((emp) => emp._id === managerId);
        setForm((prev) => ({
            ...prev,
            [idField]: managerId,
            [codeField]: manager?.employeeCode || prev[codeField],
        }));
    };

    function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setFormError('Photo must be a JPG or PNG');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setFormError('Photo must be under 2MB');
            return;
        }
        setFormError(null);
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    // ---- Submit (create or update) ----
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        try {
            const payload = { ...form };
            // Add: password is generated by the server. Edit: blank means keep current.
            if (!isEdit || !payload.password) delete payload.password;

            if (isEdit) {
                await employeeService.updateEmployee(id, payload, photoFile);
                navigate('/admin/employees');
            } else {
                const result = await employeeService.createEmployee(payload, photoFile);
                navigate('/admin/employees', {
                    state: {
                        notice: result.emailSent
                            ? { type: 'success', text: `Employee created. Login details were emailed to ${payload.email}.` }
                            : { type: 'warning', text: 'Employee created, but the email could not be sent. Use Edit to set a password and share it manually.' },
                    },
                });
            }
        } catch (err) {
            setFormError(
                err.response?.data?.message || err.message || 'Failed to save employee'
            );
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white">
                <Loader />
            </div>
        );
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/employees')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight text-[#12356F]">
                        {isEdit ? 'Edit Employee' : 'Add Employee'}
                    </h1>
                    <p className="text-sm text-[#6685B5]">
                        {isEdit
                            ? 'Update the details below.'
                            : 'Fill in the details below to add a new employee to your organization.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

                {/* ================= PROFILE PHOTO ================= */}
                <Section title="Profile Photo" icon={Camera}>
                    <div className="flex items-center gap-5 rounded-xl bg-[#F8FBFF] p-4">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-blue-100" />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                <User size={34} />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold text-[#12356F]">Upload employee photo</p>
                            <p className="mb-2 text-xs text-[#6685B5]">JPG, PNG (Max 2MB)</p>
                            <label className="inline-block cursor-pointer rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                                Choose File
                                <input type="file" accept="image/png,image/jpeg" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>
                    </div>
                </Section>

                {/* ================= PERSONAL INFORMATION ================= */}
                <Section title="Personal Information" icon={User}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <TextField label="Employee Code" name="employeeCode" value={form.employeeCode}
                            onChange={handleChange} required placeholder="e.g. EMP001" />
                        <SelectField label="Prefix" name="prefix" value={form.prefix}
                            onChange={handleChange} options={PREFIXES} required />
                        <TextField label="Full name" name="name" value={form.name}
                            onChange={handleChange} required placeholder="Enter full name" />
                        <TextField label="Date of birth" name="dateOfBirth" type="date"
                            value={form.dateOfBirth} onChange={handleChange} required />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <SelectField label="Gender" name="gender" value={form.gender}
                            onChange={handleChange} options={GENDERS} required />
                        <SelectField label="Blood group" name="bloodGroup" value={form.bloodGroup}
                            onChange={handleChange} options={BLOOD_GROUPS} required />
                        <SelectField label="Nationality" name="nationality" value={form.nationality}
                            onChange={handleChange} options={NATIONALITIES} required />
                    </div>
                </Section>

                {/* ================= WORK DETAILS ================= */}
                <Section title="Work Details" icon={Briefcase}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <TextField label="Work email" name="email" type="email" value={form.email}
                            onChange={handleChange} required placeholder="employee@company.com" />
                        <TextField label="Date of joining" name="dateOfJoining" type="date"
                            value={form.dateOfJoining} onChange={handleChange} required />
                        <SelectField label="Employment type" name="employmentType" value={form.employmentType}
                            onChange={handleChange} options={EMPLOYMENT_TYPES} required />
                        <SelectField label="Employment status" name="employmentStatus" value={form.employmentStatus}
                            onChange={handleChange} options={EMPLOYMENT_STATUSES} required placeholder="Select status" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Company is stored in officeId */}
                        <SelectField label="Company" name="officeId" value={form.officeId}
                            onChange={handleChange} options={offices} required />
                        <SelectField label="Business Unit" name="businessUnit" value={form.businessUnit}
                            onChange={handleChange} options={BUSINESS_UNITS} required />
                        <SelectField label="Department" name="department" value={form.department}
                            onChange={handleChange} options={DEPARTMENTS} required />
                        <TextField label="Designation" name="designation" value={form.designation}
                            onChange={handleChange} required placeholder="Enter designation" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <SelectField label="Branch" name="branch" value={form.branch}
                            onChange={handleChange} options={BRANCHES} required />
                        <SelectField label="Sub branch" name="subBranch" value={form.subBranch}
                            onChange={handleChange} options={SUB_BRANCHES} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <TextField label="Reporting manager code" name="reportingManagerCode"
                            value={form.reportingManagerCode} onChange={handleChange}
                            required placeholder="e.g. MGR001" />
                        <SelectField label="Reporting manager" name="reportingManagerId"
                            value={form.reportingManagerId}
                            onChange={handleManagerChange('reportingManagerId', 'reportingManagerCode')}
                            options={managerOptions} placeholder="Select manager" />
                        <TextField label="Functional manager code" name="functionalManagerCode"
                            value={form.functionalManagerCode} onChange={handleChange}
                            placeholder="e.g. FM001" />
                        <SelectField label="Functional manager" name="functionalManagerId"
                            value={form.functionalManagerId}
                            onChange={handleManagerChange('functionalManagerId', 'functionalManagerCode')}
                            options={managerOptions} placeholder="Select manager" />
                    </div>
                </Section>

                {/* ================= CONTACT & IDS ================= */}
                <Section title="Contact & IDs" icon={Phone}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <TextField label="Contact Details" name="contactNumber" type="tel"
                            value={form.contactNumber} onChange={handleChange}
                            required placeholder="+91 98765 43210" />
                        <TextField label="Aadhar" name="aadhar" value={form.aadhar}
                            onChange={handleChange} required placeholder="12 digits"
                            inputMode="numeric" maxLength={12} pattern="\d{12}"
                            title="Aadhar must be exactly 12 digits" />
                        <TextField label="PAN" name="pan" value={form.pan}
                            onChange={handleChange} required placeholder="ABCDE1234F"
                            maxLength={10} pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                            title="PAN format: 5 letters, 4 digits, 1 letter" />
                        <TextField label="Emergency Contact Details" name="emergencyContact"
                            value={form.emergencyContact} onChange={handleChange}
                            required placeholder="Name + Contact Number" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <TextField label="Email ID" name="personalEmail" type="email"
                            value={form.personalEmail} onChange={handleChange}
                            required placeholder="personal@email.com" />
                    </div>
                </Section>

                {/* ================= LOGIN ACCESS ================= */}
                <Section title="Login Access" icon={Lock}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <SelectField label="Role" name="role" value={form.role}
                            onChange={handleChange} options={ROLES} required />

                        {isEdit ? (
                            <TextField
                                label="Reset password"
                                name="password" type="password" value={form.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current"
                                autoComplete="new-password"
                            />
                        ) : (
                            <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-[#4F709F] md:col-span-3">
                                A temporary password is generated automatically and emailed to the work email.
                                The employee must change it the first time they sign in.
                            </div>
                        )}
                    </div>
                </Section>

                {formError && (
                    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-blue-50 pt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/admin/employees')}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                        Save Employee
                    </Button>
                </div>
            </form>
        </div>
    );
}