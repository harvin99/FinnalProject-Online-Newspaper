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
    let { page = 1, perPage = 10, q, role } = req.query;
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
    if (role) {
      findObj.role = role;
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
      userRoles: userModel.allRoles,
      q,
      role,
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
    res.render("admin/users/addUser", {
      categories,
      userRoles: userModel.allRoles,
      activeFeature: 5,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editUser = async (req, res) => {
  let { username } = req.params;

  let view = "admin/users/editUser";
  try {
    if (username) {
      let user = await userModel.findOne({ username }).lean();
      console.log(user);
      if (user) {
        let categories = await categoryModel.find().lean();
        let {
          categories: assignedCategories,
          username,
          email,
          fullName,
          avatar,
          role,
          dob,
          isPremium,
          expirePremium,
          pseudonym,
        } = user;

        res.render(view, {
          categories,
          userRoles: userModel.allRoles,
          assignedCategories,
          username,
          email,
          fullName,
          avatar,
          role,
          dob,
          isPremium,
          expirePremium,
          pseudonym,
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
    username,
    email,
    fullName,
    avatarHolder,
    role,
    dobValue: dob,
    isPremium,
    expirePremiumValue: expirePremium,
    assignedCategories,
    pseudonym,
    password
  } = req.body;
  let { file: avatar, user } = req;
  avatar = avatar ? getFilePath(avatar) : avatarHolder;

  try {
    let categories = await categoryModel.find().lean();
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //handle
      let newUser = new userModel({
        username,
        email,
        fullName,
        avatar,
        dob,
        isPremium,
        expirePremium: isPremium ? expirePremium : null,
        categories: assignedCategories,
        pseudonym,
        role,
      });
      await newUser.save();
      req.session.addUser = {
        success: true,
      };
      res.redirect("/admin/users");
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      console.log(formError);
      res.render(view, {
        formError,
        categories,
        userRoles: userModel.allRoles,
        username,
        email,
        fullName,
        avatar,
        role,
        dob,
        isPremium,
        expirePremium,
        assignedCategories,
        pseudonym,
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
    username,
    email,
    fullName,
    avatarHolder,
    role,
    dobValue: dob,
    isPremium,
    expirePremiumValue: expirePremium,
    assignedCategories,
    pseudonym,
  } = req.body;
  let { file: avatar, user } = req;
  avatar = avatar ? getFilePath(avatar) : avatarHolder;
  let { username: usernameParams } = req.params;

  try {
    let categories = await categoryModel.find().lean();
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //handle
      let newUser = await userModel.findOneAndUpdate(
        { username: usernameParams },
        {
          username,
          email,
          fullName,
          avatar,
          dob,
          isPremium,
          expirePremium: isPremium ? expirePremium : null,
          categories: assignedCategories || [],
          pseudonym,
          role,
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
        userRoles: userModel.allRoles,
        username,
        email,
        fullName,
        avatar,
        role,
        dob,
        isPremium,
        expirePremium,
        assignedCategories,
        pseudonym,
        activeFeature: 5,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delUser = async (req, res) => {
  let { username } = req.params;
  try {
    let user = await userModel.findOneAndDelete({
      username,
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
