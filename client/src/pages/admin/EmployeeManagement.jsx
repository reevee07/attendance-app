import React, { useEffect, useState } from 'react';
import EmployeeCard from '../../components/admin/EmployeeCard.jsx';
import AdminPunchModal from '../../components/admin/AdminPunchModal.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as employeeService from '../../services/employeeService';
import * as officeService from '../../services/officeService';

const emptyForm = { name: '', email: '', password: '', employeeCode: '', designation: '', contactNumber: '', role: 'user', officeId: '' };

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
  const [offices, setOffices] = useState([]);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [addingOffice, setAddingOffice] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    try {
      const data = await employeeService.listEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadOffices() {
  const data = await officeService.listOffices();
  setOffices(data);
 }

  useEffect(() => {
  loadEmployees();
  loadOffices();
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
    designation: employee.designation || '',
    contactNumber: employee.contactNumber || '',
    role: employee.role,
    officeId: employee.officeId?._id || employee.officeId || '',
    password: '',
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

  async function handleAddOffice() {
  if (!newOfficeName.trim()) return;
  setAddingOffice(true);
  try {
    const office = await officeService.createOffice({ name: newOfficeName.trim() });
    setOffices((prev) => [...prev, office]);
    setForm((prev) => ({ ...prev, officeId: office._id }));
    setNewOfficeName('');
  } finally {
    setAddingOffice(false);
  }
}

  async function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (form._id) {
  const { _id, ...updates } = form;
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
      <div className="mb-2 mt-20 flex items-center justify-between">
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
          <input
  required={!form._id}
  type="password"
  placeholder={form._id ? 'New password (leave blank to keep current)' : 'Temporary password'}
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
/>
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
          <div>
  <select
    value={form.officeId}
    onChange={(e) => setForm({ ...form, officeId: e.target.value })}
    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
  >
    <option value="">No office assigned</option>
    {offices.map((office) => (
      <option key={office._id} value={office._id}>
        {office.name}
      </option>
    ))}
  </select>
  <div className="mt-2 flex gap-2">
    <input
      placeholder="New office name (e.g. Kelax)"
      value={newOfficeName}
      onChange={(e) => setNewOfficeName(e.target.value)}
      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
    />
    <Button
      type="button"
      variant="secondary"
      loading={addingOffice}
      onClick={handleAddOffice}
    >
      Add
    </Button>
  </div>
</div>
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