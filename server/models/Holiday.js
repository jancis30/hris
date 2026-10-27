const db = require('../config/db');

const all = () => db.read().holidays.sort((a, b) => a.date.localeCompare(b.date));
const map = () => Object.fromEntries(db.read().holidays.map((h) => [h.date, h.name]));

function add({ date, name }) {
  const data = db.read();
  data.holidays = data.holidays.filter((h) => h.date !== date);
  data.holidays.push({ date, name });
  db.write(data);
}

function remove(date) {
  const data = db.read();
  data.holidays = data.holidays.filter((h) => h.date !== date);
  db.write(data);
}

module.exports = { all, map, add, remove };
