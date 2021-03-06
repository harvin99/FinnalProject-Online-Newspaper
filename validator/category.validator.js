const { check, body, validationResult, oneOf } = require("express-validator");
const { isEmpty } = require("./helper.validator");
const { userModel } = require("../models");
const addCategoryValidator = () => {
  return [
    ...isEmpty(["name"], "{field} does not Empty"),

    check("customSlug", "Slug invalid").custom((value, { req }) => {
      return value ? /^[a-z0-9]+(-?[a-z0-9]+)*$/i.test(value) : true;
    }),
    body("subCategories").toArray(),
  ];
};

module.exports = {
  addCategoryValidator,
};
