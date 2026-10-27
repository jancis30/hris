const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const Settings = require('../models/Settings');
const { toDate, toMinutes, dayOfWeek, eachDate } = require('../utils/date');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Business rules: which remarks apply to one employee on one date.
function remarksFor({ employee, date, log, holidayName, settings, today }) {
  const remarks = [];
  if (holidayName) remarks.push({ type: 'HOLIDAY', label: `Holiday: ${holidayName}` });

  if (log && log.timeIn) {
    const limit = toMinutes(settings.shiftStart) + Number(settings.graceMinutes || 0);
    if (!holidayName && toMinutes(log.timeIn) > limit) remarks.push({ type: 'LATE', label: 'Late' });
    if (!log.timeOut && date < today) remarks.push({ type: 'NO_TIME_OUT', label: 'No Time Out' });
  } else if (!holidayName && ![0, 6].includes(dayOfWeek(date)) && date < today && date >= employee.hired) {
    remarks.push({ type: 'ABSENT', label: 'Absent' });
  }
  return remarks;
}

function hoursOf(log) {
  if (!log || !log.timeIn || !log.timeOut) return null;
  const m = toMinutes(log.timeOut) - toMinutes(log.timeIn);
  return m > 0 ? Number((m / 60).toFixed(2)) : null;
}

function build({ from, to, employeeId }) {
  const settings = Settings.get();
  const holidays = Holiday.map();
  const today = toDate(new Date());
  const tracked = (e) => e && e.trackAttendance !== false;
  const employees = (employeeId ? [Employee.find(employeeId)] : Employee.all()).filter(tracked);
  const index = {};
  Attendance.range(from, to, employeeId).forEach((a) => (index[`${a.employeeId}|${a.date}`] = a));

  const last = to < today ? to : today;
  const rows = [];
  for (const employee of employees) {
    for (const date of eachDate(from, last)) {
      const log = index[`${employee.id}|${date}`];
      const holidayName = holidays[date];
      const weekend = [0, 6].includes(dayOfWeek(date));
      if (date < employee.hired && !log) continue;
      if (weekend && !log && !holidayName) continue;
      rows.push({
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        date,
        day: DAYS[dayOfWeek(date)],
        timeIn: log ? log.timeIn : '',
        timeOut: log ? log.timeOut : '',
        hours: hoursOf(log),
        remarks: remarksFor({ employee, date, log, holidayName, settings, today }),
      });
    }
  }
  return rows;
}

function summarize(rows) {
  const by = {};
  for (const r of rows) {
    const s = (by[r.employeeId] ||= {
      employeeId: r.employeeId, employeeName: r.employeeName,
      present: 0, late: 0, absent: 0, noTimeOut: 0, holidays: 0, hours: 0,
    });
    const has = (t) => r.remarks.some((x) => x.type === t);
    if (r.timeIn) s.present++;
    if (has('LATE')) s.late++;
    if (has('ABSENT')) s.absent++;
    if (has('NO_TIME_OUT')) s.noTimeOut++;
    if (has('HOLIDAY')) s.holidays++;
    s.hours += r.hours || 0;
  }
  return Object.values(by).map((s) => ({ ...s, hours: Number(s.hours.toFixed(2)) }));
}

module.exports = { build, summarize, remarksFor };
