const tagController = require("./admin/tag.admin.controller");
const categoryController = require("./admin/category.admin.controller");
const postController = require("./admin/post.admin.controller");
const userController = require("./admin/user.admin.controller");
const dashboard = async (req, res) => {
  res.render("admin/dashboard");
};

module.exports = {
  ...tagController,
  ...categoryController,
  ...postController,
  ...userController,
  dashboard,
};
