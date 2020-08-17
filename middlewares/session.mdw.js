const session = require("express-session");

module.exports = function (app) {
  let expireAcc = 20 *1000;
  app.set("trust proxy", 1); // trust first proxy
  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: expireAcc,
      },
    })
  );
};
