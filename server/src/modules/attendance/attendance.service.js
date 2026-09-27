const Attendance = require('./attendance.model');
const Office = require('../office/office.model');
const Employee = require('../employee/employee.model');
const { distanceInMeters } = require('../../utils/geo');
const supabase = require('../../config/supabase');
const { supabaseBucket } = require('../../config/env');

/**
 * Determines whether the next punch for this employee today should be
 * 'in' or 'out'. First punch of the day is always 'in', then it alternates.
 */
async function determineNextType(employeeId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const lastPunchToday = await Attendance.findOne({
    employeeId,
    timestamp: { $gte: startOfDay },
  }).sort({ timestamp: -1 });

  if (!lastPunchToday) return 'in';
  return lastPunchToday.type === 'in' ? 'out' : 'in';
}

/**
 * Uploads a punch photo buffer to Supabase Storage and returns its public URL.
 */
async function uploadPunchPhoto(employeeId, fileBuffer, mimeType) {
  const ext = mimeType.split('/')[1] || 'jpg';
  const path = `${employeeId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(path, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Self-punch: employee punches their own attendance with geolocation + photo.
 */
async function selfPunch({ employeeId, latitude, longitude, photoBuffer, photoMimeType }) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('Location is required to punch attendance');
  }
  if (!photoBuffer) {
    throw new Error('Photo verification is required to punch attendance');
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  let distanceFromOffice = null;
  if (employee.officeId) {
    const office = await Office.findById(employee.officeId);
    if (office) {
      distanceFromOffice = distanceInMeters(latitude, longitude, office.latitude, office.longitude);
    }
  }

  const photoUrl = await uploadPunchPhoto(employeeId, photoBuffer, photoMimeType);
  const type = await determineNextType(employeeId);

  const record = await Attendance.create({
    employeeId,
    type,
    timestamp: new Date(),
    latitude,
    longitude,
    distanceFromOffice,
    photoUrl,
    punchedBy: 'self',
  });

  return record;
}

/**
 * Admin-punch: admin punches on behalf of any employee. No geolocation, no photo.
 */
async function adminPunch({ employeeId, adminId, type, note }) {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  const resolvedType = type || (await determineNextType(employeeId));

  const record = await Attendance.create({
    employeeId,
    type: resolvedType,
    timestamp: new Date(),
    punchedBy: 'admin',
    punchedByAdminId: adminId,
    note,
  });

  return record;
}

/**
 * Employee's own attendance history (paginated by date range).
 */
async function getEmployeeHistory(employeeId, { from, to } = {}) {
  const filter = { employeeId };
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }
  return Attendance.find(filter).sort({ timestamp: -1 });
}

/**
 * Admin daily summary: first-in / last-out per employee for a given day,
 * derived from the raw punch log rather than stored separately.
 */
async function getDailySummary(dateStr) {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const summary = await Attendance.aggregate([
    { $match: { timestamp: { $gte: startOfDay, $lte: endOfDay } } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: '$employeeId',
        firstIn: {
          $min: { $cond: [{ $eq: ['$type', 'in'] }, '$timestamp', null] },
        },
        lastOut: {
          $max: { $cond: [{ $eq: ['$type', 'out'] }, '$timestamp', null] },
        },
        totalPunches: { $sum: 1 },
        hasAdminEntry: { $max: { $eq: ['$punchedBy', 'admin'] } },
      },
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $project: {
        employeeId: '$_id',
        name: '$employee.name',
        email: '$employee.email',
        firstIn: 1,
        lastOut: 1,
        totalPunches: 1,
        hasAdminEntry: 1,
        _id: 0,
      },
    },
    { $sort: { name: 1 } },
  ]);

  return summary;
}

/**
 * Distinct employees present (had a punch) per day, for the last `days` days.
 * Used to plot the admin's attendance trend graph.
 */
async function getPresentTrend(days = 7) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const rows = await Attendance.aggregate([
    { $match: { timestamp: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          employeeId: '$employeeId',
        },
      },
    },
    { $group: { _id: '$_id.date', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  // Fill in any missing days with 0 so the graph doesn't have gaps
  const byDate = Object.fromEntries(rows.map((r) => [r.date, r.count]));
  const result = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: byDate[key] || 0 });
  }
  return result;
}

/**
 * Distinct employees present today, grouped by their assigned office.
 * Powers the per-office "live ring" counts on the admin dashboard.
 */
async function getOfficePresenceToday() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const presentToday = await Attendance.distinct('employeeId', {
    timestamp: { $gte: startOfDay, $lte: endOfDay },
  });

  const offices = await Office.find();
  const employees = await Employee.find({ officeId: { $ne: null } }).select('officeId');

  const presentSet = new Set(presentToday.map((id) => id.toString()));

  return offices.map((office) => {
    const officeEmployeeIds = employees
      .filter((e) => e.officeId?.toString() === office._id.toString())
      .map((e) => e._id.toString());
    const presentCount = officeEmployeeIds.filter((id) => presentSet.has(id)).length;
    return {
      officeId: office._id,
      officeName: office.name,
      totalEmployees: officeEmployeeIds.length,
      presentToday: presentCount,
    };
  });
}

/**
 * Most recent punches across ALL employees, newest first - for the
 * admin dashboard's live "Attendance Punch History" feed.
 */
async function getRecentPunches(limit = 10) {
  return Attendance.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('employeeId', 'name');
}

module.exports = {
  determineNextType,
  selfPunch,
  adminPunch,
  getEmployeeHistory,
  getDailySummary,
  getPresentTrend,
  getOfficePresenceToday,
  getRecentPunches,
};