const { check, body, validationResult } = require("express-validator");
const { isEmpty } = require("./helper.validator");
const { userModel } = require("../models");
const addPostValidator = () => {
  return [
    ...isEmpty(
      ["title", "abstract", "category", "inputTags", "content"],
      "{field} does not Empty"
    ),
    body("isPremium").toBoolean(),
    body("inputTags").toArray(),
  ];
};

module.exports = {
  addPostValidator,
};
