// client/src/config/employeeOptions.js

// ---- Fixed lists (must match enums in employee.model.js) ----
export const PREFIXES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Permanent'];

export const EMPLOYMENT_STATUSES = ['Confirmed', 'Probation', 'Notice period', 'Relieved', 'Inactive'];

export const ROLES = [
  { value: 'user', label: 'Employee' },
  { value: 'admin', label: 'Admin' },
];

// ---- Not enums in the backend, so you can edit these freely ----
export const NATIONALITIES = ['Indian', 'American', 'British', 'Other'];

// ---- Temporary placeholders until real values are known ----
export const BUSINESS_UNITS = ['FCS', 'KELAX', 'INTECH'];
export const DEPARTMENTS = ['HR','Management', 'Accounts','SCM', 'IT','LOGISTICS', 'Operations', 'Sales'];
export const BRANCHES = ['Noida', 'Delhi'];
export const SUB_BRANCHES = ['Noida', 'Delhi'];