const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const Settings = require('../models/Settings');
const timesheet = require('../services/timesheetService');
const HttpError = require('../utils/HttpError');
const { toDate, toTime, isDate, isTime, toMinutes } = require('../utils/date');

const MAX_RANGE_DAYS = 366;

function parseRange(q) {
  const today = toDate(new Date());
  const from = q.from || today;
  const to = q.to || today;
  if (!isDate(from) || !isDate(to) || from > to) throw new HttpError(400, 'Use a valid date range (YYYY-MM-DD).');
  if ((new Date(to) - new Date(from)) / 864e5 > MAX_RANGE_DAYS) throw new HttpError(400, 'Date range is too long (max 1 year).');
  return { from, to, employeeId: q.employeeId || undefined };
}

function requireEmployee(id) {
  const employee = Employee.find(id);
  if (!employee) throw new HttpError(404, 'Employee not found.');
  return employee;
}

// ---- employee actions (signed-in user; server clock is the source of truth) ----
function requireTracked(user) {
  if (user.trackAttendance === false) throw new HttpError(403, 'This account does not track attendance.');
  return user;
}

exports.today = (req, res) => {
  const date = toDate(new Date());
  res.json({
    date,
    log: Attendance.get(req.user.id, date) || null,
    holiday: Holiday.map()[date] || null,
    settings: Settings.get(),
  });
};

exports.timeIn = (req, res) => {
  const employee = requireTracked(req.user);
  const now = new Date();
  const date = toDate(now);
  const existing = Attendance.get(employee.id, date);
  if (existing && existing.timeIn) throw new HttpError(409, `Already timed in at ${existing.timeIn}.`);
  res.status(201).json(Attendance.upsert(employee.id, date, { timeIn: toTime(now) }));
};

exports.timeOut = (req, res) => {
  const employee = requireTracked(req.user);
  const now = new Date();
  const date = toDate(now);
  const existing = Attendance.get(employee.id, date);
  if (!existing || !existing.timeIn) throw new HttpError(409, 'You have not timed in today.');
  if (existing.timeOut) throw new HttpError(409, `Already timed out at ${existing.timeOut}.`);
  res.json(Attendance.upsert(employee.id, date, { timeOut: toTime(now) }));
};

exports.mine = (req, res) => {
  const to = toDate(new Date());
  const from = toDate(new Date(Date.now() - 13 * 864e5));
  res.json(timesheet.build({ from, to, employeeId: req.user.id }));
};

// ---- admin actions ----
exports.timesheet = (req, res) => res.json(timesheet.build(parseRange(req.query)));

exports.upsert = (req, res) => {
  const { employeeId, date, timeIn, timeOut = '' } = req.body;
  requireEmployee(employeeId);
  if (!isDate(date)) throw new HttpError(400, 'Enter a valid date.');
  if (!isTime(timeIn)) throw new HttpError(400, 'Enter a valid time in.');
  if (timeOut && (!isTime(timeOut) || toMinutes(timeOut) <= toMinutes(timeIn)))
    throw new HttpError(400, 'Time out must be after time in.');
  res.json(Attendance.upsert(employeeId, date, { timeIn, timeOut }));
};

exports.parseRange = parseRange;
