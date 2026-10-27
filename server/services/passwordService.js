const crypto = require('crypto');

// Passwords are never stored: only a salted scrypt hash.
function hash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, passwordHash };
}

function verify(password, user) {
  if (!user || !user.salt || !user.passwordHash) return false;
  const expected = Buffer.from(user.passwordHash, 'hex');
  const given = crypto.scryptSync(String(password), user.salt, 64);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

// Returns an error message, or null if the password is acceptable.
function validate(password) {
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 100) return 'Password is too long.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must include a letter and a number.';
  return null;
}

module.exports = { hash, verify, validate };
