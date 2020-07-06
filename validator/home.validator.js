const { check, validationResult } = require("express-validator");
const { isEmpty } = require("./helper.validator");
const { userModel } = require("../models");
const loginValidator = () => {
  return [...isEmpty(["username", "password"], "{field} does not Empty")];
};
const registerValidator = () => {
  return [
    //transform
    // check("dobValue").toDate(),
    //empty
    ...isEmpty(
      [
        "username",
        "password",
        "fullName",
        "email",
        "confirmPassword",
        "confirmCode",
      ],
      "{field} does not Empty"
    ),
    //more
    // check("username", "Username must be at least 6 chars long").isLength({
    //   min: 6,
    // }),
    // check("password", "Password must be at least 6 chars long").isLength({
    //   min: 6,
    // }),
    check("username", "username must be only includes a-z A-Z 0-9").custom(
      (username, { req }) => {
        return /^[a-zA-Z0-9]+$/.test(username);
      }
    ),
    check("username").custom(async (username, { req }) => {
      let user = await userModel.findOne({ username }).lean();
      if (user) {
        throw Error("Username is exists");
      }
    }),
    check("email").custom(async (email, { req }) => {
      let user = await userModel.findOne({ email }).lean();
      if (user) {
        throw Error("Email is exists");
      }
    }),
    check(
      "confirmPassword",
      "Confirm Password field must have the same value as the password field"
    ).custom((value, { req }) => value === req.body.password),
    check(
      "confirmCode",
      "Confirm Coe  must have the same value as the code"
    ).custom((value, { req }) => value === req.body.code),
    check("email", "Email invalid").isEmail(),
  ];
};
module.exports = {
  loginValidator,
  registerValidator,
};
