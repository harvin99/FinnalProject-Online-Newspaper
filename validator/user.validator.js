const { check, body, validationResult } = require("express-validator");
const { isEmpty } = require("./helper.validator");
const { userModel } = require("../models");
const addUserValidator = () => {
  return [
    ...isEmpty(["username", "fullName", "email"], "{field} does not Empty"),
    body("isPremium").toBoolean(),
    body("expirePremiumValue").toDate(),
    body("dobValue").toDate(),
  ];
};

module.exports = {
  addUserValidator,
};
