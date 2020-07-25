const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../../validator");
const {
  postModel,
  userModel,
  categoryModel,
  tagModel,
} = require("../../models");
const { getFilePath } = require("../../controllers/upload.Controller");
const config = require("../../config");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { jsHelper } = require("../../utils");
module.exports.getUsers = async (req, res) => {
  try {
    let { user } = req;
    let { page = 1, perPage = 10, q, status } = req.query;
    let showMessageModal = null;

    //message response
    let { delUser, addUser, editUser } = req.session;
    if (delUser) {
      if (delUser.errors) {
        showMessageModal = {
          type: "danger",
          title: "Delete User",
          message: delUser.errors,
        };
      } else if (delUser.success) {
        showMessageModal = {
          type: "success",
          title: "Delete User",
          message: "Delete user successfull",
        };
      }

      req.session.delUser = null;
    }
    if (addUser) {
      if (addUser.errors) {
        showMessageModal = {
          type: "danger",
          title: "Add User",
          message: addUser.errors,
        };
      } else if (addUser.success) {
        showMessageModal = {
          type: "success",
          title: "Add User",
          message: "Add user successfull",
        };
      }
      req.session.addUser = null;
    }
    if (editUser) {
      if (editUser.errors) {
        showMessageModal = {
          type: "danger",
          title: "Edit User",
          message: editUser.errors,
        };
      } else if (editUser.success) {
        showMessageModal = {
          type: "success",
          title: "Edit User",
          message: "Edit user successfull",
        };
      }
      req.session.editUser = null;
    }

    let findObj = {};
    if (q) {
      findObj.$text = {
        $search: q,
      };
    }
    if (status) {
      findObj.status = status;
    }

    let users = await userModel
      .find(findObj, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })

      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean({ virtuals: true });
    let totalUsers = (await userModel.countDocuments(findObj)) || 1;

    res.render("admin/users/users", {
      users,
      userStatus: userModel.userStatusEnum,
      q,
      status,
      pagination: {
        page,
        pageCount: totalUsers / perPage,
      },
      activeFeature: 5,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.getUser = async (req, res) => {
  let { username } = req.params;
  let { user } = req;
  let view = "admin/users/user";
  try {
    let profileUser = await userModel.findOne({ username }).lean();
    console.log(profileUser);
    res.render(view, {
      profileUser,
      activeFeature: 5,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addUser = async (req, res) => {
  try {
    let categories = await categoryModel.find().lean();
    let tags = await tagModel.find().lean();
    res.render("admin/users/addUser", { categories, tags, activeFeature: 5 });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editUser = async (req, res) => {
  let { slug } = req.params;

  let view = "admin/users/editUser";
  try {
    let categories = await categoryModel.find().lean();
    let tags = await tagModel.find().lean();
    if (slug) {
      let user = await userModel.findOne({
        slug,
      });
      if (user) {
        let {
          title,
          abstract,
          content,
          avatar,
          category,
          tags: inputTags,
          isPremium,
        } = user;

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
          activeFeature: 5,
        });
      } else {
        req.session.editUser = {
          errors: "user not found",
        };
        res.redirect("/admin/users");
      }
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addUser_post = async (req, res) => {
  let view = "admin/users/addUser";
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
            inputTags[inputTagsIndex] = slug;
          }
          return curTag;
        })
      );
      subCategory = await categoryModel.findSubCategory(category);
      let author = await userModel.findById(user._id);

      let newUser = new userModel({
        title,

        abstract,
        avatar,
        tags: dbTags,
        isPremium,
        content,
        category: subCategory,
        author,
        avatar,
      });

      await newUser.save();

      req.session.addUser = {
        success: true,
      };
      res.redirect("/admin/users");
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
      //   activeFeature: 5,
      //   addUser,
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
        activeFeature: 5,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editUser_post = async (req, res) => {
  let view = "admin/users/editUser";
  let {
    title,
    abstract,
    content,
    category,
    inputTags,
    isPremium,
    avatarHolder,
  } = req.body;
  let { file: avatar } = req;
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
            inputTags[inputTagsIndex] = slug;
          }
          return curTag;
        })
      );
      subCategory = await categoryModel.findSubCategory(category);

      let user = await userModel.findOneAndUpdate(
        {
          slug: slugParams,
          status: ["NotPublished", "Denied"],
        },
        {
          title,

          abstract,
          avatar,
          tags: dbTags,
          isPremium,
          content,
          category: subCategory,
          status: userModel.userStatusEnum[0],
          avatar,
        },
        {
          new: true,
        }
      );

      if (user) {
        req.session.editUser = {
          success: true,
        };
      } else {
        req.session.editUser = {
          errors: "user not found",
        };
      }

      res.redirect("/admin/users");
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
      //   activeFeature: 5,
      //   addUser,
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
        activeFeature: 5,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delUser = async (req, res) => {
  let { slug } = req.params;
  try {
    let user = await userModel.findOneAndDelete({
      slug,
    });

    if (user) {
      req.session.delUser = {
        success: true,
      };
    } else {
      req.session.delUser = {
        errors: "user not found",
      };
    }
  } catch (error) {
    req.session.delUser = {
      errors: error.toString(),
    };
  } finally {
    res.redirect("/admin/users");
  }
};
