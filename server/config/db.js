// JSON-file "database". Reads/writes are synchronous, so requests never interleave.
const fs = require('fs');
const path = require('path');

const FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json');
const EMPTY = {
  employees: [],
  attendance: [],
  holidays: [],
  settings: { shiftStart: '09:00', shiftEnd: '18:00', graceMinutes: 0 },
};

function write(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE); // atomic swap so a crash never leaves a half-written file
}

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      write(EMPTY);
      return JSON.parse(JSON.stringify(EMPTY));
    }
    throw err;
  }
}

module.exports = { read, write };
