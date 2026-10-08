import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminPunchModal from '../../components/admin/AdminPunchModal.jsx';
import Loader from '../../components/common/Loader.jsx';

import * as employeeService from '../../services/employeeService';
import * as officeService from '../../services/officeService';

import {
  UserPlus,
  Users,
  UserCheck,
  PauseCircle,
  BriefcaseBusiness,
  Search,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  MoreVertical,
  Pencil,
  ChevronRight,
} from 'lucide-react';


export default function EmployeeManagement() {
  const navigate = useNavigate();

  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice || null);

  useEffect(() => {
    // Clear router state so a page refresh doesn't show the banner again
    if (location.state?.notice) window.history.replaceState({}, document.title);
  }, []);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [punchTarget, setPunchTarget] = useState(null);

  const [offices, setOffices] = useState([]);

  // Page filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Three-dot menu
  const [openMenu, setOpenMenu] = useState(null);


  /* -------------------------------------------------------
     LOAD EMPLOYEES
  ------------------------------------------------------- */

  async function loadEmployees() {
    setLoading(true);

    try {
      const data = await employeeService.listEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }


  /* -------------------------------------------------------
     LOAD OFFICES
  ------------------------------------------------------- */

  async function loadOffices() {
    try {
      const data = await officeService.listOffices();
      setOffices(data);
    } catch {
      setOffices([]);
    }
  }


  useEffect(() => {
    loadEmployees();
    loadOffices();
  }, []);


  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  function getOffice(employee) {
    if (!employee.officeId) return null;

    if (typeof employee.officeId === 'object') {
      return employee.officeId;
    }

    return offices.find(
      (office) => office._id === employee.officeId
    );
  }


  function getOfficeName(employee) {
    const office = getOffice(employee);

    return office?.name || 'No office';
  }


  function getEmployeeCode(employee) {
    return employee.employeeCode || '—';
  }


  function getInitials(name = '') {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }


  /* -------------------------------------------------------
     FILTERED EMPLOYEES
  ------------------------------------------------------- */

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const officeName = getOfficeName(employee);

      const matchesSearch =
        !query ||
        employee.name?.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) ||
        employee.employeeCode?.toLowerCase().includes(query) ||
        employee.contactNumber?.toLowerCase().includes(query) ||
        officeName?.toLowerCase().includes(query);

      const matchesDepartment =
        !departmentFilter ||
        getOffice(employee)?._id === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [
    employees,
    offices,
    search,
    departmentFilter,
  ]);


  /* -------------------------------------------------------
     KPI DATA
  ------------------------------------------------------- */

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) =>
      employee.status !== 'inactive'
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) =>
      employee.status === 'on_leave' ||
      employee.status === 'leave'
  ).length;

  const departmentCount = offices.length;


  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-6 flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Users
              size={28}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h1 className="text-[30px] font-bold tracking-tight text-[#12356F]">
              Employees
            </h1>
          </div>

        </div>


        <button
          type="button"
          onClick={() => navigate('/admin/employees/new')}
          className="flex h-12 items-center gap-2 rounded-xl bg-[#1268F3] px-6 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(18,104,243,0.25)] transition hover:bg-[#075CE0]"
        >
          <UserPlus size={19} />
          Add Employee
        </button>

      </div>

      {notice && (
        <div
          className={`mb-4 flex items-start justify-between gap-4 rounded-xl px-4 py-3 text-sm ${notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-orange-50 text-orange-700'
            }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold">×</button>
        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-4">

        {/* Total Employees */}
        <div className="group flex items-center justify-between rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-4 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Users size={23} />
            </div>

            <div>
              <p className="text-xs font-medium text-[#6685B5]">
                Total Employees
              </p>

              <p className="mt-1 text-2xl font-bold text-[#12356F]">
                {totalEmployees}
              </p>
            </div>

          </div>

          <ChevronRight
            size={21}
            className="text-blue-600 transition group-hover:translate-x-1"
          />

        </div>


        {/* Active */}
        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-5 py-4 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <UserCheck size={23} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#6685B5]">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-[#12356F]">
              {activeEmployees}
            </p>
          </div>

        </div>


        {/* On Leave */}
        <div className="flex items-center gap-4 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white px-5 py-4 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <PauseCircle size={23} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#6685B5]">
              On Leave
            </p>

            <p className="mt-1 text-2xl font-bold text-[#12356F]">
              {onLeaveEmployees}
            </p>
          </div>

        </div>


        {/* Departments */}
        <div className="flex items-center gap-4 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white px-5 py-4 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <BriefcaseBusiness size={23} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#6685B5]">
              Departments
            </p>

            <p className="mt-1 text-2xl font-bold text-[#12356F]">
              {departmentCount}
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="mb-4 flex flex-col gap-3 md:flex-row">

        {/* Search */}
        <div className="relative flex-1">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee by name, email or employee ID..."
            className="h-12 w-full rounded-xl border border-blue-100 bg-white pl-11 pr-4 text-sm text-[#12356F] shadow-sm outline-none transition placeholder:text-[#7391BD] focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />

        </div>


        {/* Department filter */}
        <div className="relative w-full md:w-56">

          <select
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value)
            }
            className="h-12 w-full appearance-none rounded-xl border border-blue-100 bg-white px-4 pr-10 text-sm font-medium text-[#244A80] shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All Departments
            </option>

            {offices.map((office) => (
              <option
                key={office._id}
                value={office._id}
              >
                {office.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"
          />

        </div>

      </div>


      {/* =====================================================
          EMPLOYEE TABLE
      ===================================================== */}

      {loading ? (

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white">
          <Loader />
        </div>

      ) : (

        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

          {/* Table header */}
          <div className="grid grid-cols-[2.1fr_2fr_2fr_1fr] items-center bg-[#F3F8FF] px-5 py-3 text-xs font-semibold text-[#5276AA]">

            <div>
              Employee
            </div>

            <div>
              Contact
            </div>

            <div>
              Department
            </div>

            <div className="text-right pr-4">
              Actions
            </div>

          </div>


          {/* Rows */}
          <div className="divide-y divide-blue-50">

            {filteredEmployees.length === 0 ? (

              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-400">
                  <Users size={25} />
                </div>

                <p className="font-semibold text-[#12356F]">
                  No employees found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Try changing your search or department filter.
                </p>

              </div>

            ) : (

              filteredEmployees.map((employee) => {

                const office = getOffice(employee);

                return (
                  <div
                    key={employee._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/admin/employees/${employee._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/admin/employees/${employee._id}`);
                    }}
                    className="group grid min-h-[76px] cursor-pointer grid-cols-[2.1fr_2fr_2fr_1fr] items-center px-5 transition hover:bg-[#F8FBFF]"
                  >

                    {/* Employee */}
                    <div className="flex min-w-0 items-center gap-3">

                      {employee.photoUrl ? (

                        <img
                          src={employee.photoUrl}
                          alt={employee.name}
                          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />

                      ) : (

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-sm font-semibold text-gray-600 ring-2 ring-white">
                          {getInitials(employee.name)}
                        </div>

                      )}

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[#12356F]">
                          {employee.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#6D8AB7]">
                          {employee.designation || 'Employee'}
                        </p>

                      </div>

                    </div>


                    {/* Contact */}
                    <div className="min-w-0 space-y-1">

                      <div className="flex items-center gap-2">

                        <Mail
                          size={14}
                          className="shrink-0 text-[#6686B6]"
                        />

                        <span className="truncate text-xs text-[#6686B6]">
                          {employee.email}
                        </span>

                      </div>

                      <div className="flex items-center gap-2">

                        <Phone
                          size={14}
                          className="shrink-0 text-[#6686B6]"
                        />

                        <span className="text-xs text-[#6686B6]">
                          {employee.contactNumber || '—'}
                        </span>

                      </div>

                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <Building2 size={16} />
                      </div>

                      <div>
                        <span className="text-sm font-semibold text-blue-600">
                          {office?.name || 'No office'}
                        </span>

                        <p className="mt-1 text-xs text-[#4F709F]">
                          {getEmployeeCode(employee)}
                        </p>
                      </div>

                    </div>


                    {/* Actions (clicks here must not open the profile) */}
                    <div
                      className="flex items-center justify-end gap-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setPunchTarget(employee)
                        }
                        className="rounded-full bg-[#1268F3] px-6 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(18,104,243,0.2)] transition hover:bg-[#075CE0]"
                      >
                        Punch
                      </button>


                      {/* Three dots */}
                      <div className="relative">

                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === employee._id
                                ? null
                                : employee._id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#12356F] transition hover:bg-blue-50"
                        >
                          <MoreVertical size={19} />
                        </button>


                        {openMenu === employee._id && (

                          <div className="absolute right-0 top-10 z-50 w-32 overflow-hidden rounded-xl border border-blue-100 bg-white p-1 shadow-[0_8px_25px_rgba(18,53,111,0.15)]">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/employees/${employee._id}/edit`)
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#12356F] hover:bg-blue-50"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>
                );
              })

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          PUNCH MODAL
      ===================================================== */}

      <AdminPunchModal
        employee={punchTarget}
        open={!!punchTarget}
        onClose={() => setPunchTarget(null)}
        onSuccess={loadEmployees}
      />

    </div>
  );
}