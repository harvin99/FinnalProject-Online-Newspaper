const { userModel } = require("./../models");
const jwt = require("jsonwebtoken");
const authenticationConfig = require("./../config").authentication;
const parseTokenToUser = async (req, res, next) => {
  if (!req.user) {
    let { token } = req.cookies;
    if (token) {
      try {
        var decoded = jwt.verify(token, authenticationConfig.jwtPrivateKey);
        let user = await userModel.findById(decoded.id).lean();
        req.user = user;
      } catch (error) {}
    }
  }
  next();
};
const needRole = (x) => {
  let roles = x;
  console.log(typeof roles);
  if (typeof roles === "string") {
    roles = [roles];
  }

  if (roles instanceof Array) {
    return (req, res, next) => {
      let { user } = req;
      if (user && user.role && roles.includes(user.role.toLowerCase())) {
        next();
      } else {
        res.render("errors/404", {
          errors: "permission denied",
        });
      }
    };
  }
};
module.exports = {
  parseTokenToUser,
  needRole,
};
