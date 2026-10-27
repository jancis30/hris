const crypto = require('crypto');
const Employee = require('../models/Employee');
const HttpError = require('../utils/HttpError');

const TTL = 8 * 60 * 60 * 1000;
const sessions = new Map(); // token -> { userId, expiry }  (in memory: everyone signs in again after a server restart)

function createSession(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { userId, expiry: Date.now() + TTL });
  return token;
}
function destroySession(token) {
  sessions.delete(token);
}
function revokeSessions(userId, exceptToken) {
  for (const [t, s] of sessions) if (s.userId === userId && t !== exceptToken) sessions.delete(t);
}

// Valid session, even if the user still has to change a temporary password.
function requireSession(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const s = sessions.get(token);
  if (!s || s.expiry < Date.now()) return next(new HttpError(401, 'Please sign in.'));
  const user = Employee.find(s.userId); // loaded fresh each request, so removals and role changes apply immediately
  if (!user) return next(new HttpError(401, 'Please sign in.'));
  req.user = user;
  req.token = token;
  next();
}

// Valid session AND password already changed.
function requireAuth(req, res, next) {
  requireSession(req, res, (err) => {
    if (err) return next(err);
    if (req.user.mustChangePassword)
      return next(new HttpError(403, 'You must change your temporary password first.', 'PASSWORD_CHANGE_REQUIRED'));
    next();
  });
}

const requireAdmin = [
  requireAuth,
  (req, res, next) => (req.user.role === 'admin' ? next() : next(new HttpError(403, 'Admins only.'))),
];

module.exports = { createSession, destroySession, revokeSessions, requireSession, requireAuth, requireAdmin };
