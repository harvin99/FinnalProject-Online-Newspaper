const tagController = require("./admin/tag.admin.controller");
const categoryController = require("./admin/category.admin.controller");
const dashboard = async (req, res) => {
  res.render("admin/dashboard");
};

module.exports = {
  ...tagController,
  ...categoryController,
  dashboard,
};
