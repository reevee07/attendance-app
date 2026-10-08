const bcrypt = require("bcryptjs");
const Employee = require("./employee.model");
const supabase = require("../../config/supabase");
const { supabaseBucket } = require("../../config/env");
const { sendEmail } = require("../../utils/brevo");
const { generatePassword } = require("../../utils/generatePassword");

// Only these fields may be written from the form (whitelist)
const ALLOWED_FIELDS = [
  "name",
  "email",
  "role",
  "employeeCode",
  "designation",
  "contactNumber",
  "company",
  "officeId",
  "prefix",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "nationality",
  "dateOfJoining",
  "employmentType",
  "employmentStatus",
  "businessUnit",
  "department",
  "branch",
  "subBranch",
  "reportingManagerCode",
  "reportingManagerId",
  "functionalManagerCode",
  "functionalManagerId",
  "aadhar",
  "pan",
  "emergencyContact",
  "personalEmail",
];

// These can never be cleared
const REQUIRED_FIELDS = ["name", "email", "role"];

// Splits form data into values to set and fields to clear.
// Empty strings are never stored, so enum, ObjectId and sparse-unique fields don't break.
function splitPayload(data) {
  const set = {};
  const unset = {};
  for (const [key, value] of Object.entries(data)) {
    if (!ALLOWED_FIELDS.includes(key)) continue;
    const isEmpty = value === "" || value === null || value === undefined;
    if (isEmpty) {
      if (!REQUIRED_FIELDS.includes(key)) unset[key] = 1;
    } else {
      set[key] = typeof value === "string" ? value.trim() : value;
    }
  }
  return { set, unset };
}

const escapeHtml = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

function buildCredentialsEmail({ name, email, password }) {
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#12356F">
      <h2 style="margin-bottom:4px">Welcome, ${escapeHtml(name)}</h2>
      <p>Your account has been created. Use these details to sign in:</p>
      <table style="background:#F3F8FF;border-radius:8px;padding:12px 16px;width:100%">
        <tr><td style="color:#6685B5">Login email</td><td><b>${escapeHtml(email)}</b></td></tr>
        <tr><td style="color:#6685B5">Temporary password</td><td><b>${escapeHtml(password)}</b></td></tr>
      </table>
      <p>
        <a href="${loginUrl}" style="display:inline-block;background:#1268F3;color:#fff;
           padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Sign in</a>
      </p>
      <p style="color:#6685B5;font-size:13px">
        You will be asked to choose a new password the first time you sign in.
        Please do not share this email.
      </p>
    </div>`;
}

async function uploadEmployeePhoto(employeeId, fileBuffer, mimeType) {
  const ext = mimeType.split("/")[1] || "jpg";
  const path = `profiles/${employeeId}.${ext}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(path, fileBuffer, { contentType: mimeType, upsert: true }); // upsert - allows re-uploading on edit

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`; // cache-bust so updated photos show immediately
}

async function createEmployee(data, photoFile) {
  const { set } = splitPayload(data);
  if (!set.name || !set.email) throw new Error("Name and email are required");

  set.email = set.email.toLowerCase();

  const existing = await Employee.findOne({ email: set.email });
  if (existing) throw new Error("An employee with this email already exists");

  if (set.employeeCode) {
    const codeTaken = await Employee.findOne({
      employeeCode: set.employeeCode,
    });
    if (codeTaken) throw new Error("Employee code already exists");
  }

  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  set.role = set.role || "user";

  let employee = await Employee.create({
    ...set,
    passwordHash,
    mustChangePassword: true,
  });

  if (photoFile) {
    const photoUrl = await uploadEmployeePhoto(
      employee._id,
      photoFile.buffer,
      photoFile.mimetype,
    );
    employee = await Employee.findByIdAndUpdate(
      employee._id,
      { photoUrl },
      { new: true },
    );
  }

  // The employee is already saved, so an email failure must not undo it
  const emailSent = await sendEmail({
    to: employee.email,
    subject: "Your account has been created",
    htmlContent: buildCredentialsEmail({
      name: employee.name,
      email: employee.email,
      password: tempPassword,
    }),
  });

  // Never send the hash back to the browser
  const safe = employee.toObject();
  delete safe.passwordHash;

  return { employee: safe, emailSent };
}

async function listEmployees(filter = {}) {
  return Employee.find(filter)
    .select("-passwordHash")
    .populate("officeId", "name")
    .populate("reportingManagerId", "name employeeCode")
    .populate("functionalManagerId", "name employeeCode");
}

async function getEmployeeById(id) {
  const employee = await Employee.findById(id)
    .select("-passwordHash")
    .populate("officeId", "name")
    .populate("reportingManagerId", "name employeeCode")
    .populate("functionalManagerId", "name employeeCode");
  if (!employee) throw new Error("Employee not found");
  return employee;
}

async function updateEmployee(id, updates, photoFile) {
  const { password } = updates;
  const { set, unset } = splitPayload(updates); // passwordHash/status/_id are ignored by the whitelist

  if (password && password.trim()) {
    set.passwordHash = await bcrypt.hash(password, 10);
    set.mustChangePassword = true;
  }

  if (photoFile) {
    set.photoUrl = await uploadEmployeePhoto(
      id,
      photoFile.buffer,
      photoFile.mimetype,
    );
  }

  const update = { $set: set };
  if (Object.keys(unset).length) update.$unset = unset;

  const employee = await Employee.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!employee) throw new Error("Employee not found");
  return employee;
}

async function deactivateEmployee(id) {
  const employee = await Employee.findByIdAndUpdate(
    id,
    { status: "inactive" },
    { new: true },
  ).select("-passwordHash");

  if (!employee) throw new Error("Employee not found");
  return employee;
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};
