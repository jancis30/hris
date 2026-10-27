const Employee = require('../models/Employee');
const HttpError = require('../utils/HttpError');
const passwords = require('../services/passwordService');
const { revokeSessions } = require('../middleware/auth');

exports.list = (req, res) => res.json(Employee.list());

exports.create = (req, res) => {
  const name = String(req.body.name || '').trim();
  const username = String(req.body.username || '').trim().toLowerCase();
  const role = req.body.role === 'admin' ? 'admin' : 'employee';
  if (!name) throw new HttpError(400, 'Employee name is required.');
  if (!/^[a-z0-9._-]{3,30}$/.test(username))
    throw new HttpError(400, 'Username must be 3-30 characters: letters, numbers, dot, dash or underscore.');
  if (Employee.findByUsername(username)) throw new HttpError(409, 'That username is already taken.');
  const problem = passwords.validate(req.body.password);
  if (problem) throw new HttpError(400, problem);
  res.status(201).json(
    Employee.create({ name, department: String(req.body.department || '').trim(), username, password: req.body.password, role })
  );
};

exports.resetPassword = (req, res) => {
  const problem = passwords.validate(req.body.password);
  if (problem) throw new HttpError(400, problem);
  const user = Employee.setPassword(req.params.id, req.body.password, true); // must change at next login
  if (!user) throw new HttpError(404, 'Employee not found.');
  revokeSessions(user.id);
  res.json(user);
};

exports.remove = (req, res) => {
  if (req.params.id === req.user.id) throw new HttpError(400, 'You cannot remove your own account.');
  if (!Employee.remove(req.params.id)) throw new HttpError(404, 'Employee not found.');
  revokeSessions(req.params.id);
  res.status(204).end();
};
