const pad = (n) => String(n).padStart(2, '0');

const toDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toMinutes = (t) => {
  const [h, m] = t.split(':');
  return Number(h) * 60 + Number(m);
};
const dayOfWeek = (s) => new Date(`${s}T00:00:00`).getDay();
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(`${s}T00:00:00`));
const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const eachDate = (from, to) => {
  const out = [];
  for (let d = new Date(`${from}T00:00:00`); toDate(d) <= to; d.setDate(d.getDate() + 1)) out.push(toDate(d));
  return out;
};

module.exports = { toDate, toTime, toMinutes, dayOfWeek, isDate, isTime, eachDate };
