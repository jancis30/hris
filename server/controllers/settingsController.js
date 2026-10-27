const Settings = require('../models/Settings');
const HttpError = require('../utils/HttpError');
const { isTime } = require('../utils/date');

exports.get = (req, res) => res.json(Settings.get());

exports.update = (req, res, next) => {
  const { shiftStart, shiftEnd, graceMinutes } = req.body;
  if (!isTime(shiftStart) || !isTime(shiftEnd)) return next(new HttpError(400, 'Enter valid shift times.'));
  const grace = Number(graceMinutes);
  if (!Number.isFinite(grace) || grace < 0) return next(new HttpError(400, 'Grace minutes must be 0 or more.'));
  res.json(Settings.update({ shiftStart, shiftEnd, graceMinutes: grace }));
};
