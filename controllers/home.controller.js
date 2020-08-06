const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");
const { userModel, postModel, categoryModel, tagModel } = require("../models");
const config = require("../config");
const crypto = require("crypto");

module.exports.getHome = async (req, res) => {
  let view = "home/home";
  try {
    // await postModel.update(
    //   { view: 13 },
    //   {
    //     view: Math.floor(Math.random() * 100),
    //   }
    // );
    let featuredPosts = await postModel
      .find({
        status: "Published",
        timePost: {
          $gte: moment().subtract(7, "days").toDate(),
        },
      })
      .lean({ virtuals: true });
    featuredPosts = featuredPosts.sort((a, b) => b.score - a.score);
    let mostViewedPosts = await postModel
      .find({ status: "Published" })
      .limit(10)
      .sort("-view")
      .lean({ virtuals: true });
    let lastestPosts = await postModel
      .find({ status: "Published" })
      .limit(10)
      .sort("-timePost")
      .lean({ virtuals: true });

    //top
    let top10Categories = await postModel.aggregate([
      {
        $group: {
          _id: "$category.slug",
          totalView: {
            $sum: "$view",
          },
        },
      },
      {
        $sort: {
          totalView: -1,
        },
      },

      { $limit: 10 },
    ]);
    top10Categories = top10Categories.map((i) => i._id);

    let topCategoryPosts = await Promise.all(
      top10Categories.map(async (slug) => {
        return await postModel
          .findOne({ status: "Published", "category.slug": slug })
          .limit(10)
          .sort("-view")
          .lean({ virtuals: true });
      })
    );
    topCategoryPosts = topCategoryPosts.sort((a, b) => b.view - a.view);
    res.render("home/home", {
      featuredPosts,
      mostViewedPosts,
      lastestPosts,
      topCategoryPosts,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.getTag = async (req, res) => {
  let view = "home/tag";
  let { page = 1, perPage = 10 } = req.query;
  let { slug } = req.params;
  try {
    let tag = await tagModel.findOne({ slug }).lean();

    let posts = await postModel
      .find({
        status: "Published",
        "tags.slug": slug,
      })
      .sort("-timePost")
      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean({ virtuals: true });
    let postCount =
      (await postModel.countDocuments({
        status: "Published",
        "tags.slug": slug,
      })) || 1;
    let pageCount = Math.ceil(postCount / perPage);
    res.render(view, {
      posts,
      tag,
      pagination: {
        page,
        pageCount,
      },
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.getCategory = async (req, res) => {
  let view = "home/category";
  let { page = 1, perPage = 10 } = req.query;
  let { slug } = req.params;
  try {
    let post = await postModel.findOne();
    console.log(post.tags);

    let category = await categoryModel
      .findOne({
        $or: [
          {
            slug,
          },
          {
            "subCategory.slug": slug,
          },
        ],
      })
      .lean();
    if (category) {
      if (category.slug === slug) {
        //root
        slug = category.subCategories.map((i) => i.slug);
      } else {
        //child
        category = category.subCategories.find((i) => i.slug === slug);
        if (category) {
          slug = category.slug;
        } else {
          throw new Error("Category not Found");
        }
      }
    }
    let posts = await postModel
      .find({
        status: "Published",
        "category.slug": slug,
      })
      .sort("-timePost")
      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean({ virtuals: true });
    let postCount =
      (await postModel.countDocuments({
        status: "Published",
        "category.slug": slug,
      })) || 1;
    let pageCount = Math.ceil(postCount / perPage);
    res.render(view, {
      posts,
      category,
      pagination: {
        page,
        pageCount,
      },
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.login = (req, res) => {
  res.locals.header = false;
  res.render("home/login");
};
module.exports.register = (req, res) => {
  res.render("home/register");
};
module.exports.login_post = async (req, res) => {
  let { retUrl } = req.query;
  let view = "home/login";
  let { username, password } = req.body;
  try {
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //handle

      let user = await userModel.findOne({ username });
      if (user) {
        let comparePasswordResult = await bcrypt.compare(
          password,
          user.password
        );

        if (comparePasswordResult) {
          let token = user.token();

          res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
          res.redirect(retUrl ? retUrl : "/");
        } else {
          res.render(view, {
            formError: {
              submit: "Username or Password incorrect",
            },
            username,
            password,
          });
        }
      } else {
        res.render(view, {
          formError: {
            submit: "Username or Password incorrect",
          },
          username,
          password,
        });
      }
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      res.render(view, { formError, username, password });
    }
  } catch (error) {
    res.render(view, { errors: error.toString() });
  }
};
module.exports.register_post = async (req, res) => {
  let view = "home/register";

  let {
    username,
    email,
    password,
    confirmPassword,
    fullName,

    confirmCode,
  } = req.body;
  try {
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      let newUser = await userModel.create({
        username,
        email,
        password,
        fullName,
      });
      res.render(view, {
        success: "create user successfully",
        formError,
        username,
        email,
        password,
        confirmPassword,
        fullName,

        confirmCode,
      });
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      res.render(view, {
        formError,
        username,
        email,
        password,
        confirmPassword,
        fullName,

        confirmCode,
      });
    }
  } catch (error) {}
};
module.exports.facebook = (req, res, next) => {
  passport.authenticate("facebook", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.cookie("token", user.token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      return res.redirect("/");
    });
  })(req, res, next);
};
module.exports.google = (req, res, next) => {
  passport.authenticate("google", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.cookie("token", user.token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      return res.redirect("/");
    });
  })(req, res, next);
};
module.exports.logout = async (req, res) => {
  req.logout();

  res.cookie("token", "", { maxAge: Date.now() });
  res.clearCookie("token");
  res.redirect("/");
};

module.exports.getRegisterCode = async (req, res) => {
  let length = 5;

  return res.json({
    code: crypto.randomBytes(length).toString("hex"),
  });
};
