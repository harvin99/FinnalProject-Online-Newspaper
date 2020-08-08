const { jsHelper } = require("../utils");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { categoryModel, postModel, tagModel, userModel } = require("../models");
const Category = require("../models/category.model");
const { use } = require("passport");
module.exports.getCategories = async (req, res) => {
  try {
    let { user } = req;
    let categories;
    if (user.categories) {
      categories = await categoryModel
        .find({
          _id: user.categories,
        })
        .lean();
    }
    res.render("editor/manager", { categories: categories, activeFeature: 1 });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.getPosts = async (req, res) => {
  try {
    let { slug } = req.params;
    let posts;
    posts = await postModel
      .find({
        "category.slug": slug,
      })
      .lean();
    res.render("editor/posts", { posts });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.denialPost = async (req, res) => {
  try {
    let { slug } = req.params;
    let post;
    if (slug) {
      post = await postModel
        .findOne({
          slug: slug,
        })
        .lean();
    }
    res.render("editor/denial", { post });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.denialPost_post = async (req, res) => {
  try {
    let { reason } = req.body;
    let { slug } = req.params;
    let status = "Từ chối";
    await postModel.updateOne(
      { slug: slug },
      {
        reason,
        status,
      }
    );
    res.redirect("/editor");
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.acceptPost = async (req, res) => {
  try {
    let { slug } = req.params;
    let tags;
    let post;
    if (slug) {
      post = await postModel
        .findOne({
          slug: slug,
        })
        .lean();
    }
    tags = await tagModel.find().lean();
    res.render("editor/pass", { post, tags });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.acceptPost_post = async (req, res) => {
  try {
    let { slug } = req.params;
    let { subCategory, tags, time } = req.body;
    let status = "Đã duyệt";
    let timePost = moment(time).format("YYYY-MM-DD HH:mm:ss");
    console.log(timePost);
    if (slug) {
      await postModel.updateOne(
        { slug: slug },
        {
          subCategory,
          tags,
          timePost,
          status,
        }
      );
    }
    res.redirect("/editor");
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.cancelPost = async (req, res) => {
  try {
    let { slug } = req.params;
    let status = "Chờ duyệt";
    if (slug) {
      await postModel.updateOne(
        { slug: slug },
        {
          status,
        }
      );
    }
    res.render("editor/");
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
