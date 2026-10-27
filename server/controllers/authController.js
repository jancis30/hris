const Employee = require('../models/Employee');
const HttpError = require('../utils/HttpError');
const passwords = require('../services/passwordService');
const { createSession, destroySession, revokeSessions } = require('../middleware/auth');
const throttle = require('../middleware/loginThrottle');

exports.login = (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const key = `${username}|${req.ip}`;
  throttle.check(key);
  const user = Employee.findByUsername(username);
  if (!user || !passwords.verify(password, user)) {
    throttle.fail(key);
    throw new HttpError(401, 'Incorrect username or password.');
  }
  throttle.clear(key);
  res.json({ token: createSession(user.id), user: Employee.publicView(user) });
};

exports.me = (req, res) => res.json(Employee.publicView(req.user));

exports.logout = (req, res) => {
  destroySession(req.token);
  res.status(204).end();
};

exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!passwords.verify(String(currentPassword || ''), req.user)) throw new HttpError(400, 'Current password is incorrect.');
  const problem = passwords.validate(newPassword);
  if (problem) throw new HttpError(400, problem);
  if (newPassword === currentPassword) throw new HttpError(400, 'New password must be different from the current one.');
  const user = Employee.setPassword(req.user.id, newPassword, false);
  revokeSessions(req.user.id, req.token); // sign out other devices
  res.json({ user });
};
