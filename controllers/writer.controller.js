const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");
const { userModel, postModel, categoryModel, tagModel } = require("../models");
const { getFilePath } = require("./upload.controller");
const config = require("../config");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { jsHelper } = require("../utils");
module.exports.getPost = async (req, res) => {
  try {
    let { user } = req;
    let { page = 1, perPage = 10, q, status } = req.query;
    let showMessageModal = null;
    if (user && user._id) {
      //message response
      let { delPost, addPost, editPost } = req.session;
      if (delPost) {
        if (delPost.errors) {
          showMessageModal = {
            type: "danger",
            title: "Delete Post",
            message: delPost.errors,
          };
        } else if (delPost.success) {
          showMessageModal = {
            type: "success",
            title: "Delete Post",
            message: "Delete post successfull",
          };
        }

        req.session.delPost = null;
      }
      if (addPost) {
        if (addPost.errors) {
          showMessageModal = {
            type: "danger",
            title: "Add Post",
            message: addPost.errors,
          };
        } else if (addPost.success) {
          showMessageModal = {
            type: "success",
            title: "Add Post",
            message: "Add post successfull",
          };
        }
        req.session.addPost = null;
      }
      if (editPost) {
        if (editPost.errors) {
          showMessageModal = {
            type: "danger",
            title: "Edit Post",
            message: editPost.errors,
          };
        } else if (editPost.success) {
          showMessageModal = {
            type: "success",
            title: "Edit Post",
            message: "Edit post successfull",
          };
        }
        req.session.editPost = null;
      }
      let authorId = ObjectId(user._id);

      let findObj = { "author._id": authorId };
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
        showMessageModal,
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
    res.render("writer/addPost", { categories, tags, activeFeature: 2 });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editPost = async (req, res) => {
  let { slug } = req.params;
  let { user } = req;
  let view = "writer/editPost";
  try {
    let categories = await categoryModel.find().lean();
    let tags = await tagModel.find().lean();
    if (user && user._id && slug) {
      let post = await postModel.findOne({
        slug,
        "author._id": user._id,
      });
      if (post) {
        let {
          title,
          abstract,
          content,
          avatar,
          category,
          tags: inputTags,
          isPremium,
        } = post;

        category = category.slug;
        inputTags = inputTags.map((i) => i.slug);
        res.render(view, {
          categories,
          tags,
          title,
          abstract,
          content,
          avatar,
          category,
          inputTags,
          isPremium,
          activeFeature: 1,
        });
      } else {
        req.session.editPost = {
          errors: "post not found",
        };
        res.redirect("/writer");
      }
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addPost_post = async (req, res) => {
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
            inputTags[inputTagIndex] = slug;
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

      req.session.addPost = {
        success: true,
      };
      res.redirect("/writer");
      // res.render(view, {
      //   categories,
      //   tags,
      //   title,
      //   abstract,
      //   content,
      //   category,
      //   inputTags,
      //   isPremium,
      //   avatar,
      //   activeFeature: 2,
      //   addPost,
      // });
    } else {
      formError = formError.formatWith(errorFormatter).mapped();

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
        activeFeature: 2,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editPost_post = async (req, res) => {
  let view = "writer/editPost";
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
  let { slug: slugParams } = req.params;
  avatar = avatar ? getFilePath(avatar) : avatarHolder;

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
            inputTags[inputTagIndex] = slug;
          }
          return curTag;
        })
      );
      subCategory = await categoryModel.findSubCategory(category);
      let author = await userModel.findById(user._id);
      let post = await postModel.findOneAndUpdate(
        { slug: slugParams, "author._id": user._id },
        {
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
        },
        {
          new: true,
        }
      );

      if (post) {
        req.session.editPost = {
          success: true,
        };
      } else {
        req.session.editPost = {
          errors: "post not found",
        };
      }

      res.redirect("/writer");
      // res.render(view, {
      //   categories,
      //   tags,
      //   title,
      //   abstract,
      //   content,
      //   category,
      //   inputTags,
      //   isPremium,
      //   avatar,
      //   activeFeature: 2,
      //   addPost,
      // });
    } else {
      formError = formError.formatWith(errorFormatter).mapped();

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
        activeFeature: 2,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delPost = async (req, res) => {
  let { user } = req;
  let { slug } = req.params;
  try {
    let post = await postModel.findOneAndDelete({
      slug,
      "author._id": user._id,
    });

    if (post) {
      req.session.delPost = {
        success: true,
      };
    } else {
      req.session.delPost = {
        errors: "post not found",
      };
    }
  } catch (error) {
    req.session.delPost = {
      errors: error.toString(),
    };
  } finally {
    res.redirect("/writer");
  }
};
