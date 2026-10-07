import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, User, Briefcase, Phone, Mail, Building2,
  Eye, EyeOff, ShieldCheck,
} from 'lucide-react';

import Loader from '../../components/common/Loader.jsx';
import { Section } from '../../components/admin/FormFields.jsx';
import * as employeeService from '../../services/employeeService';

// ---- Helpers ----
const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

const getInitials = (name = '') =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

// Label + value (shows "—" when empty)
function Detail({ label, value, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-[#6685B5]">{label}</p>
      <div className="break-words text-sm font-semibold text-[#12356F]">
        {children ?? (value || <span className="font-normal text-gray-400">—</span>)}
      </div>
    </div>
  );
}

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

// Aadhar / PAN are hidden by default, with a show/hide toggle
function SensitiveValue({ value }) {
  const [visible, setVisible] = useState(false);
  if (!value) return <span className="font-normal text-gray-400">—</span>;

  const masked = value.length > 4 ? '•'.repeat(value.length - 4) + value.slice(-4) : value;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="tracking-wider">{visible ? value : masked}</span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-blue-500 hover:text-blue-700"
        title={visible ? 'Hide' : 'Show'}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </span>
  );
}

const managerText = (manager, code) => {
  if (manager && typeof manager === 'object') {
    return manager.employeeCode ? `${manager.name} (${manager.employeeCode})` : manager.name;
  }
  return code || null;
};

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    employeeService
      .getEmployee(id)
      .then((data) => { if (!cancelled) setEmp(data); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load employee');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white">
        <Loader />
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/employees')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to employees
        </button>
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || 'Employee not found'}
        </p>
      </div>
    );
  }

  const fullName = [emp.prefix, emp.name].filter(Boolean).join(' ');
  const isActive = emp.status !== 'inactive';
  const company = emp.officeId && typeof emp.officeId === 'object' ? emp.officeId.name : null;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/employees')}
          className="flex items-center gap-3 text-[#12356F]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
            <ArrowLeft size={18} />
          </span>
          <span className="text-[28px] font-bold tracking-tight">Employee Profile</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/admin/employees/${emp._id}/edit`)}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#1268F3] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(18,104,243,0.25)] transition hover:bg-[#075CE0]"
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>

      {/* Header card */}
      <div className="mb-6 flex flex-col items-center gap-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm md:flex-row">
        {emp.photoUrl ? (
          <img
            src={emp.photoUrl}
            alt={emp.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-blue-300 text-3xl font-bold text-blue-700 ring-4 ring-white shadow">
            {getInitials(emp.name)}
          </div>
        )}

        <div className="min-w-0 flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-[#12356F]">{fullName}</h2>
          <p className="mt-1 text-sm text-[#6685B5]">
            {emp.designation || 'Employee'}
            {emp.department ? ` · ${emp.department}` : ''}
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
            {emp.employeeCode && <Badge>{emp.employeeCode}</Badge>}
            <Badge color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Badge>
            {emp.employmentType && <Badge color="purple">{emp.employmentType}</Badge>}
            {emp.employmentStatus && <Badge color="orange">{emp.employmentStatus}</Badge>}
            <Badge color={emp.role === 'admin' ? 'red' : 'blue'}>
              {emp.role === 'admin' ? 'Admin' : 'Employee'}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#4F709F] md:justify-start">
            <span className="flex items-center gap-2"><Mail size={15} />{emp.email}</span>
            {emp.contactNumber && (
              <span className="flex items-center gap-2"><Phone size={15} />{emp.contactNumber}</span>
            )}
            {company && (
              <span className="flex items-center gap-2"><Building2 size={15} />{company}</span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Employee Code" value={emp.employeeCode} />
            <Detail label="Prefix" value={emp.prefix} />
            <Detail label="Full name" value={emp.name} />
            <Detail label="Date of birth" value={formatDate(emp.dateOfBirth)} />
            <Detail label="Gender" value={emp.gender} />
            <Detail label="Blood group" value={emp.bloodGroup} />
            <Detail label="Nationality" value={emp.nationality} />
          </div>
        </Section>

        <Section title="Work Details" icon={Briefcase}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Work email" value={emp.email} />
            <Detail label="Date of joining" value={formatDate(emp.dateOfJoining)} />
            <Detail label="Employment type" value={emp.employmentType} />
            <Detail label="Employment status" value={emp.employmentStatus} />
            <Detail label="Company" value={company} />
            <Detail label="Business Unit" value={emp.businessUnit} />
            <Detail label="Department" value={emp.department} />
            <Detail label="Designation" value={emp.designation} />
            <Detail label="Branch" value={emp.branch} />
            <Detail label="Sub branch" value={emp.subBranch} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 border-t border-blue-50 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Reporting manager code" value={emp.reportingManagerCode} />
            <Detail label="Reporting manager"
                    value={managerText(emp.reportingManagerId, null)} />
            <Detail label="Functional manager code" value={emp.functionalManagerCode} />
            <Detail label="Functional manager"
                    value={managerText(emp.functionalManagerId, null)} />
          </div>
        </Section>

        <Section title="Contact & IDs" icon={Phone}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Contact number" value={emp.contactNumber} />
            <Detail label="Personal email" value={emp.personalEmail} />
            <Detail label="Emergency contact" value={emp.emergencyContact} />
            <Detail label="Aadhar"><SensitiveValue value={emp.aadhar} /></Detail>
            <Detail label="PAN"><SensitiveValue value={emp.pan} /></Detail>
          </div>
        </Section>

        <Section title="Account" icon={ShieldCheck}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Role" value={emp.role === 'admin' ? 'Admin' : 'Employee'} />
            <Detail label="Account status" value={isActive ? 'Active' : 'Inactive'} />
            <Detail label="Created on" value={formatDate(emp.createdAt)} />
            <Detail label="Last updated" value={formatDate(emp.updatedAt)} />
          </div>
        </Section>
      </div>
    </div>
  );
}