const { check, validationResult } = require("express-validator");
const { isEmpty } = require("./helper.validator");
const loginValidator = () => {
  return [...isEmpty(["username", "password"], "{field} does not Empty")];
};
const registerValidator = () => {
  return [
    //transform
    // check("dobValue").toDate(),
    //empty
    ...isEmpty(["username", "password", "fullName"], "{field} does not Empty"),
    //more
    check("username", "Username more than 6 degits").isLength({ min: 6 }),
    check("password", "Password more than 6 degits").isLength({ min: 6 }),
    check("email", "Email invalid").isEmail(),
  ];
};
module.exports = {
  loginValidator,
  registerValidator,
};
