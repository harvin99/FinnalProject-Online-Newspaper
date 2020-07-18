const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");
const { userModel, postModel } = require("../models");
const config = require("../config");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
module.exports.getPost = async (req, res) => {
  try {
    let { user } = req;
    let { page = 1, perPage = 10 } = req.query;
    if (user && user._id) {
      let author = ObjectId(user._id);

      let posts = await postModel
        .find({ author })
        .populate(["category", "tags"])
        .limit(perPage)
        .skip((page - 1) * perPage)
        .lean({ virtuals: true });
      let totalPosts = (await postModel.countDocuments({ author })) || 1;

      res.render("writer/posts", {
        posts,
        pagination: {
          page,
          pageCount: totalPosts / perPage,
        },
      });
    } else {
      throw new Error("permision denied");
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delPost = async (req, res) => {
  res.redirect("back  ");
};
