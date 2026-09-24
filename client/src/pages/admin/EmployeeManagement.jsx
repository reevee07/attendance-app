import React, { useEffect, useState } from 'react';
import EmployeeCard from '../../components/admin/EmployeeCard.jsx';
import AdminPunchModal from '../../components/admin/AdminPunchModal.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as employeeService from '../../services/employeeService';

const emptyForm = { name: '', email: '', password: '', employeeCode: '', designation: '', contactNumber: '', role: 'user' };

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [punchTarget, setPunchTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    try {
      const data = await employeeService.listEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function resetPhotoState() {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function openCreateForm() {
    setForm(emptyForm);
    resetPhotoState();
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(employee) {
    setForm({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      employeeCode: employee.employeeCode || '',
      role: employee.role,
      password: '',
      designation: employee.designation || '',
      contactNumber: employee.contactNumber || '',
    });
    setPhotoFile(null);
    setPhotoPreview(employee.photoUrl || null);
    setFormError(null);
    setFormOpen(true);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (form._id) {
        const { password, _id, ...updates } = form;
        await employeeService.updateEmployee(_id, updates, photoFile);
      } else {
        await employeeService.createEmployee(form, photoFile);
      }
      setFormOpen(false);
      resetPhotoState();
      loadEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
        <Button onClick={openCreateForm}>Add Employee</Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-2">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp._id}
              employee={emp}
              onPunchClick={setPunchTarget}
              onEditClick={openEditForm}
            />
          ))}
        </div>
      )}

      <AdminPunchModal
        employee={punchTarget}
        open={!!punchTarget}
        onClose={() => setPunchTarget(null)}
        onSuccess={loadEmployees}
      />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={form._id ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                No photo
              </div>
            )}
            <label className="cursor-pointer text-sm font-medium text-brand-600 hover:text-brand-700">
              {photoPreview ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {!form._id && (
            <input
              required
              type="password"
              placeholder="Temporary password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          )}
          <input
            required
            placeholder="Employee code"
            value={form.employeeCode}
            onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Contact Number"
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="user">Employee</option>
            <option value="admin">Admin</option>
          </select>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" loading={submitting} className="w-full">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}