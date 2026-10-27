const db = require('../config/db');

const get = (employeeId, date) =>
  db.read().attendance.find((a) => a.employeeId === employeeId && a.date === date);

const range = (from, to, employeeId) =>
  db
    .read()
    .attendance.filter((a) => a.date >= from && a.date <= to && (!employeeId || a.employeeId === employeeId));

function upsert(employeeId, date, { timeIn, timeOut }) {
  const data = db.read();
  let log = data.attendance.find((a) => a.employeeId === employeeId && a.date === date);
  if (!log) {
    log = { employeeId, date, timeIn: '', timeOut: '' };
    data.attendance.push(log);
  }
  if (timeIn !== undefined) log.timeIn = timeIn;
  if (timeOut !== undefined) log.timeOut = timeOut;
  db.write(data);
  return log;
}

module.exports = { get, range, upsert };
