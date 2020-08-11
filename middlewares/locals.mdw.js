module.exports = function (app) {
  app.use(async function (req, res, next) {
    let { user } = req;
    res.locals.user = user;
    next();
  });
};
