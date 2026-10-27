const HttpError = require('../utils/HttpError');

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map(); // key -> { count, until }

exports.check = (key) => {
  const f = fails.get(key);
  if (f && f.until > Date.now())
    throw new HttpError(429, `Too many failed attempts. Try again in ${Math.ceil((f.until - Date.now()) / 60000)} minute(s).`);
};
exports.fail = (key) => {
  const f = fails.get(key) || { count: 0, until: 0 };
  f.count += 1;
  if (f.count >= MAX_FAILS) { f.until = Date.now() + LOCK_MS; f.count = 0; }
  fails.set(key, f);
};
exports.clear = (key) => fails.delete(key);
