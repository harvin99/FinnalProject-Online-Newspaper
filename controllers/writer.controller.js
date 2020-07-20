const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");
const { userModel, postModel, categoryModel, tagModel } = require("../models");
const { getFilePath } = require("../controllers/upload.Controller");
const config = require("../config");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { jsHelper } = require("../utils");
module.exports.getPost = async (req, res) => {
  try {
    let { user } = req;
    let { page = 1, perPage = 10, q, status } = req.query;
    if (user && user._id) {
      let author = ObjectId(user._id);
      let findObj = { author };
      if (q) {
        findObj.$text = {
          $search: q,
        };
      }
      if (status) {
        findObj.status = status;
      }

      let posts = await postModel
        .find(findObj, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })

        .limit(perPage)
        .skip((page - 1) * perPage)
        .lean({ virtuals: true });
      let totalPosts = (await postModel.countDocuments(findObj)) || 1;

      res.render("writer/posts", {
        posts,
        postStatus: postModel.postStatusEnum,
        q,
        status,
        pagination: {
          page,
          pageCount: totalPosts / perPage,
        },
        activeFeature: 1,
      });
    } else {
      throw new Error("permision denied");
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addPost = async (req, res) => {
  try {
    let categories = await categoryModel.find().lean();
    let tags = await tagModel.find().lean();
    res.render("writer/addPost", { categories, tags });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addPost_post = async (req, res) => {
  console.log(req.body, "run");
  let view = "writer/addPost";
  let {
    title,
    abstract,
    content,
    category,
    inputTags,
    isPremium,
    avatarHolder,
  } = req.body;
  let { file: avatar, user } = req;
  avatar = avatar ? getFilePath(avatar) : avatarHolder;
  console.log(avatar);
  try {
    let categories = await categoryModel.find().lean();
    let tags = await tagModel.find().lean();
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //handle

      let slug = jsHelper.generateSlug(title);
      let dbTags = await Promise.all(
        inputTags.map(async (inputTag, inputTagIndex) => {
          let curTag = await tagModel.findOne({ slug: inputTag }).lean();
          let slug = jsHelper.generateSlug(inputTag);
          if (!curTag) {
            curTag = new tagModel({
              name: inputTag,
              slug,
            });
            await curTag.save();
            inputTags[inputTagsIndex] = slug;
          }
          return curTag;
        })
      );
      subCategory = await categoryModel.findSubCategory(category);
      let author = await userModel.findById(user._id);

      let newPost = new postModel({
        title,
        slug,
        abstract,
        avatar,
        tags: dbTags,
        isPremium,
        content,
        category: subCategory,
        author,
        avatar,
      });

      await newPost.save();
      res.render(view, {
        categories,
        tags,
        title,
        abstract,
        content,
        category,
        inputTags,
        isPremium,
        avatar,
      });
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      console.log("no fỏm erro", formError);
      res.render(view, {
        formError,
        categories,
        tags,
        title,
        abstract,
        content,
        category,
        inputTags,
        isPremium,
        avatar,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delPost = async (req, res) => {
  res.redirect("back");
};
