const passport = require("passport");
const facebook = require("./facebook");
const google = require("./google");
module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });
  facebook();
  google();
};
