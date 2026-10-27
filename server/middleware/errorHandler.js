module.exports = (err, req, res, next) => {
  if (!err.status) console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.status ? err.message : 'Something went wrong on the server.', code: err.code });
};
