const { check, validationResult } = require("express-validator");
const homeValidator = require("./home.validator");
const postValidator = require("./post.validator");
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Build your resulting errors however you want! String, object, whatever - it works!
  return `${location}[${param}]: ${msg}`;
};
module.exports = {
  errorFormatter,
  ...homeValidator,
  ...postValidator,
};
