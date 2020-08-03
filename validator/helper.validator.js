const { check, validationResult } = require("express-validator");

const isEmpty = (fields = [], msg = "") => {
  if (Array.isArray(fields)) {
    return fields.map((field) => {
      return check(field, msg.replace("{field}", field)).not().isEmpty();
    });
  }
  return [];
};
const isLength = (fields = [], msg = "") => {
  if (Array.isArray(fields)) {
    return fields.map((field) => {
      let { name, min = 0, max, type = "string" } = field;
      let fmsg = msg
        .replace("{field}", name)
        .replace("{min}", min)
        .replace("{max}", max);
      if (type === "string") {
        return check(name, fmsg).isLength({ min, max });
      }
      if (type == "int") {
        return check(name, fmsg).isInt({ min, max });
      }
    });
  }
  return [];
};
module.exports = {
  isEmpty,
  isLength,
};
