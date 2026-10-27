const db = require('../config/db');
const { toDate } = require('../utils/date');
const { hash } = require('../services/passwordService');

const publicView = (e) => {
  if (!e) return null;
  const { passwordHash, salt, ...rest } = e; // never expose credentials
  return rest;
};

const all = () => db.read().employees;
const list = () => all().map(publicView);
const find = (id) => all().find((e) => e.id === id);
const findByUsername = (u) => all().find((e) => e.username === u);

const nextId = (employees) =>
  'E' + String(Math.max(0, ...employees.map((e) => parseInt(e.id.slice(1), 10) || 0)) + 1).padStart(3, '0');

function create({ name, department, username, password, role = 'employee', trackAttendance = true }) {
  const data = db.read();
  const employee = {
    id: nextId(data.employees),
    name,
    department: department || '-',
    hired: toDate(new Date()),
    username,
    role,
    trackAttendance,
    mustChangePassword: true, // admin-set passwords are temporary
    ...hash(password),
  };
  data.employees.push(employee);
  db.write(data);
  return publicView(employee);
}

function setPassword(id, password, mustChangePassword) {
  const data = db.read();
  const e = data.employees.find((x) => x.id === id);
  if (!e) return null;
  Object.assign(e, hash(password), { mustChangePassword });
  db.write(data);
  return publicView(e);
}

function remove(id) {
  const data = db.read();
  const before = data.employees.length;
  data.employees = data.employees.filter((e) => e.id !== id);
  db.write(data);
  return data.employees.length < before;
}

// On startup: give every account a login, and make sure an admin exists.
function ensureAccounts() {
  const data = db.read();
  let changed = false;
  for (const e of data.employees) {
    if (!e.passwordHash) {
      Object.assign(e, { username: e.username || e.id.toLowerCase(), role: e.role || 'employee', mustChangePassword: true }, hash('welcome123'));
      console.log(`Created login for ${e.name}: username "${e.username}", temporary password "welcome123"`);
      changed = true;
    }
  }
  if (!data.employees.some((e) => e.role === 'admin')) {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    data.employees.push({
      id: nextId(data.employees), name: 'Administrator', department: 'Admin', hired: toDate(new Date()),
      username: 'admin', role: 'admin', trackAttendance: false, mustChangePassword: true, ...hash(password),
    });
    console.log('Created admin account: username "admin" (you must change the password at first login)');
    changed = true;
  }
  if (changed) db.write(data);
}

module.exports = { publicView, all, list, find, findByUsername, create, setPassword, remove, ensureAccounts };
