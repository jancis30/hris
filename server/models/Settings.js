const db = require('../config/db');

const get = () => db.read().settings;

function update(patch) {
  const data = db.read();
  data.settings = { ...data.settings, ...patch };
  db.write(data);
  return data.settings;
}

module.exports = { get, update };
