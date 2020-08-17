const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");

const {
  userModel,
  postModel,
  categoryModel,
  tagModel,
  commentModel,
} = require("../models");
const config = require("../config");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
module.exports.getHome = async (req, res) => {
  let view = "home/home";
  try {
    let featuredPosts = await postModel
      .find({
        status: "Published",
        timePost: {
          //Get posts from day create from subtract Day
          $gte: moment().subtract(30, "days").toDate(),
        },
      })
      .limit(4)
      .lean({ virtuals: true });

    featuredPosts = featuredPosts.sort((a, b) => b.score - a.score);
    let featuredAuthor = featuredPosts[0].author;
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
      
    let topCategoryPosts_sorted = topCategoryPosts.filter(post => post).sort((a, b) => {
      return b.view - a.view;
    });
    res.render(view, {
      featuredPosts,
      mostViewedPosts,
      lastestPosts,
      topCategoryPosts: topCategoryPosts_sorted,
      featuredAuthor,
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
            "subCategories.slug": slug,
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
module.exports.searchPosts = async (req, res) => {
  let sortBys = {
    viewAsc: "view",
    viewDesc: "-view",
    dateAsc: "timePost",
    dateDesc: "-timePost",
    likeAsc: "like",
    likeDesc: "-like",
    default: { score: { $meta: "textScore" } },
  };
  let sortByOptions = [
    {
      name: "Mặc định",
      value: "default",
    },
    {
      name: "Lượt xem tăng dần",
      value: "viewAsc",
    },
    {
      name: "Lượt xem giảm dần",
      value: "viewDesc",
    },
    {
      name: "Ngày xuất bản tăng dần",
      value: "dateAsc",
    },
    {
      name: "Ngày xuất bản giảm dần",
      value: "dateAsc",
    },
    {
      name: "Lượt like tăng dần",
      value: "likeAsc",
    },
    {
      name: "Lượt like tăng dần",
      value: "likeAsc",
    },
  ];
  let view = "home/search";
  let {
    page = 1,
    perPage = 10,
    category: categorySlug,
    tag: tagSlug,
    q,
    isPremium,
    sortBy = "default",
  } = req.query;
  isPremium = isPremium == "false" ? fasle : !!isPremium;
  let { slug } = req.params;
  try {
    let allCategories = await categoryModel.find().lean();
    let allTags = await tagModel.find().lean();
    let post = await postModel.findOne();
    let where = { status: "Published" };
    if (categorySlug) {
      let category = await categoryModel
        .findOne({
          $or: [
            {
              slug: categorySlug,
            },
            {
              "subCategories.slug": categorySlug,
            },
          ],
        })
        .lean();

      if (category) {
        if (category.slug === categorySlug) {
          //root
          where["category.slug"] = category.subCategories.map((i) => i.slug);
        } else {
          //child
          category = category.subCategories.find(
            (i) => i.slug === categorySlug
          );
          if (category) {
            where["category.slug"] = category.slug;
          } else {
            console.log("run");
            throw new Error("Category not Found");
          }
        }
      } else {
        throw new Error("Category not Found");
      }
    }
    if (tagSlug) {
      let tag = await tagModel.find({ slug: tagSlug }).lean();
      if (tag) {
        where["tags.slug"] = { $in: tag.map((i) => i.slug) };
      }
    }
    if (q) {
      where.$text = {
        $search: q,
      };
    }
    if (isPremium) {
      where.isPremium = isPremium;
    }

    let posts = await postModel
      .find(where, { score: { $meta: "textScore" } })

      .sort(sortBys[sortBy])
      .limit(perPage)
      .skip((page - 1) * perPage)
      .lean({ virtuals: true });
    let postCount = (await postModel.countDocuments(where)) || 0;
    let pageCount = Math.ceil(postCount / (perPage || 1));
    res.render(view, {
      posts,
      category: categorySlug,
      tag: tagSlug,
      allTags,
      allCategories,
      isPremium,
      q,
      sortBy,
      sortByOptions,
      postCount,
      pagination: {
        page,
        pageCount,
      },
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.getPost = async (req, res) => {
  let view = "home/postDetail";
  let { categorySlug, postSlug: slug } = req.params;
  let { user = {} } = req;
  try {
    let post = await postModel.findOne({ slug, "category.slug": categorySlug });

    //inc view
    post.view++;
    await post.save();

    post = post.toObject();

    let islikedUser = post && !!post.like.find((i) => i._id.equals(user._id));

    let relativePosts = post
      ? await postModel
          .find(
            {
              $text: {
                $search: post.title,
              },
              "category.slug": post.category.slug,
            },
            { score: { $meta: "textScore" } }
          )
          .sort({ score: { $meta: "textScore" } })
          .limit(6)
          .lean()
      : [];
    relativePosts = relativePosts.slice(1);
    let isPremiumUser =
      user.isPremium &&
      moment(user.expirePremium).diff(moment(), "seconds") > 0;
    res.render(view, { post, islikedUser, relativePosts, isPremiumUser });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.likePost = async (req, res) => {
  let view = "home/postDetail";
  let { categorySlug, postSlug: slug } = req.params;
  let { user } = req;
  try {
    if (!user) {
      throw new Error("Only the user can like the post");
    }
    //get post
    let post = await postModel.findOne({ slug, "category.slug": categorySlug });

    if (!post) {
      throw new Error("Post not founded");
    }
    //check exists
    let isLikedIndex = post.like.findIndex((i) => i._id.equals(user._id));
    if (isLikedIndex !== -1) {
      post.like.splice(isLikedIndex, 1);
    } else {
      post.like.push(user);
    }
    await post.save();

    res.redirect("back");
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.commentPost = async (req, res) => {
  let view = "home/postDetail";
  let { categorySlug, postSlug: slug } = req.params;
  let { user } = req;
  let { content, relyCommentId, fullName, email } = req.body;
  let avatar = user && user.avatar;

  try {
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //get post
      let post = await postModel.findOne({
        slug,
        "category.slug": categorySlug,
      });
      if (!post) {
        throw new Error("Post not founded");
      }
      let newComment = new commentModel({
        email,
        fullName,
        avatar,
        content,
      });
      await newComment.save();
      if (relyCommentId) {
        let parentCommentIndex = post.comments.findIndex((i) =>
          i._id.equals(relyCommentId)
        );
        if (parentCommentIndex != -1) {
          let parentComment = await commentModel.findById(
            post.comments[parentCommentIndex]._id
          );
          parentComment.relyComments.push(newComment);
          await parentComment.save();
          post.comments[parentCommentIndex] = parentComment;
        } else {
          throw new Error("Parent Comment not founded");
        }
      } else {
        post.comments.push(newComment);
      }
      console.log("run parent comment");
      post.markModified("comments");
      let a = await post.save();

      console.log("run parent comment 2", a);
      res.redirect("back");
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      res.render(view, { formError, username, password });
    }
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
