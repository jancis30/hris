const Holiday = require('../models/Holiday');
const HttpError = require('../utils/HttpError');
const { isDate } = require('../utils/date');

exports.list = (req, res) => res.json(Holiday.all());

exports.create = (req, res, next) => {
  const name = String(req.body.name || '').trim();
  if (!isDate(req.body.date) || !name) return next(new HttpError(400, 'Holiday date and name are required.'));
  Holiday.add({ date: req.body.date, name });
  res.status(201).json(Holiday.all());
};

exports.remove = (req, res) => {
  Holiday.remove(req.params.date);
  res.status(204).end();
};
