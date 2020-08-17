const { jsHelper } = require("../utils");
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
    const category = await categoryModel.findOne({
      slug: slug,
    });
    let arrSlug = [];
    for (i = 0; i < category.subCategories.length; i++) {
      arrSlug.push(category.subCategories[i].slug);
    }
    
    posts = await postModel
      .find({
        "category.slug": arrSlug,
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
    let status = "Denied";
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
    const category = await categoryModel
      .findOne({
        "subCategories.slug": post.category.slug,
      })
      .lean();
    tags = await tagModel.find().lean();
    res.render("editor/pass", { post, category, tags });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.acceptPost_post = async (req, res) => {
  try {
    let { slug } = req.params;
    let { subCategory, tags, time } = req.body;
    const category = await categoryModel.findSubCategory(subCategory);
    //console.log(category);
    let status = "Published";
    let timePost = moment(time).format("YYYY-MM-DD HH:mm:ss");
    console.log(timePost);
    if (slug) {
      await postModel.updateOne(
        { slug: slug },
        {
          subCategory,
          category,
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
    let status = "WaitingForPublication";
    if (slug) {
      await postModel.updateOne(
        { slug: slug },
        {
          status,
        }
      );
    }
    res.redirect("/editor");
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
