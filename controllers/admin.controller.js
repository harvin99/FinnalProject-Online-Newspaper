const tagController = require("./admin/tag.admin.controller");
const categoryController = require("./admin/category.admin.controller");
const postController = require("./admin/post.admin.controller");
const userController = require("./admin/user.admin.controller");

const { userModel, postModel, categoryModel, tagModel } = require("../models");

const dashboard = async (req, res) => {
  try {
    const users = await userModel.find();
    const posts = await postModel.find();
    const categories = await categoryModel.find();
    const tags = await tagModel.find();
    res.render("admin/dashboard", {
      categories: categories ? categories.length : 0,
      posts: posts ? posts.length : 0,
      tags: tags ? tags.length : 0,
      users: users ? users.length : 0,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports = {
  ...tagController,
  ...categoryController,
  ...postController,
  ...userController,
  dashboard,
};
