const { ObjectId } = require("mongodb");
const { jsHelper } = require("../utils");
const moment = require("moment")
const {categoryModel, postModel, tagModel} = require("../models");
const Category = require("../models/category.model");
module.exports.getCategories = async (req, res) => {
  try {
    let { user } = req;
    let categories;
    if(user.categories)
    {
      categories = await categoryModel.find({
        _id: user.categories
      }).lean()
    }
    res.render("editor/manager",{ categories:categories });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.getPosts = async (req, res) => {
  try {
    let { slug } = req.params;
    let category = await categoryModel.findOne({
      slug: slug
    }).lean();
    let posts
    if(category){
      posts = await postModel.find({
        categories: category._id
      }).lean();
    }
    res.render("editor/posts",{category, posts});
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.denialPost = async (req, res) => {
  try {
    let { slug } = req.params;
    let { user } = req;
    let post;
    if(slug)
    {
      post = await postModel.findOne({
        slug: slug
      }).lean();
    }
    res.render("editor/denial",{post});
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.denialPost_post = async (req, res) => {
  try {
    let { reason } = req.body;
    let {slug} = req.params;
    let status = "Từ chối"
    await postModel.updateOne(
      {slug: slug},
      {
        reason,
        status
      }
    )
  }catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
}

module.exports.acceptPost = async (req, res) => {
  try {
    let { slug } = req.params;
    let categories;
    let tags;
    let post;
    categories = await categoryModel.find().lean();
    tags = await tagModel.find().lean();
    if(slug)
    {
      post = await postModel.findOne({
        slug: slug
      }).lean();
    }
    res.render("editor/pass",{post, categories, tags});
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.acceptPost_post = async (req, res) => {
  try {
    let { slug } = req.params;
    let { categorySlug, tags, time} = req.body;
    let status = "Chấp thuận"
    category = await categoryModel.findOne({
      slug: categorySlug
    })
    
    let timePost = moment(time).toDate();
    console.log(typeof timePost)
    console.log(timePost)
    if(slug)
    {
      await postModel.updateOne(
        {slug: slug},
        {
          category,
          tags,
          timePost
        })
    }
    //res.render("editor/pass",{post, categories, tags});
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};