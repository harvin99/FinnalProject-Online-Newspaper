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

module.exports = {
  parseTokenToUser,
};
