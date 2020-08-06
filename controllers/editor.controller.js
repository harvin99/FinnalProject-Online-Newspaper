const { ObjectId } = require("mongodb");
const { jsHelper } = require("../utils");
const moment = require("moment");
const { categoryModel, postModel, tagModel, userModel } = require("../models");
const { uploadUserImage } = require("../controllers/upload.Controller");
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
    res.render("editor/manager", { categories: categories });
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

module.exports.getProfile = async (req, res) => {
  try {
    let { user } = req;
    res.render("home/profile", { user });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editNameProfile = async (req, res) => {
  try {
    const { user } = req;
    let isErrorsName = false;
    const { fullName } = req.body;
    if (fullName != "") {
      await userModel.updateOne(
        { _id: user._id },
        {
          fullName: fullName,
        }
      );
    } else {
      isErrorsName = true;
      const messError = "Tên mới không được trống.";
      res.render("home/profile", {
        user,
        isErrorsName,
        messError,
      });
    }
    if (isErrorsName == false) {
      res.redirect("/editor/profile");
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editNameAvatar = async (req, res) => {
  try {
    const { file: avatar, user } = req;
    let isErrorsImg = false;
    if (avatar != "") {
      console.log(avatar);
    } else {
      isErrorsImg = true;
      const messError = "Chưa chọn file.";
      res.render("home/profile", {
        user,
        isErrorsImg,
        messError,
      });
    }
    if (isErrorsImg == false) {
      res.redirect("/editor/profile");
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editDoBProfile = async (req, res) => {
  try {
    const { user } = req;
    let isErrorsDoB = false;
    const { newdob } = req.body;
    if (newdob) {
      let dob = moment(newdob).format("YYYY-MM-DD");
      await userModel.updateOne(
        { _id: user._id },
        {
          dob,
        }
      );
    } else {
      isErrorsDoB = true;
      const messError = "Ngày sinh không hợp lệ.";
      res.render("home/profile", {
        user,
        isErrorsDoB,
        messError,
      });
    }
    if (isErrorsDoB == false) {
      res.redirect("/editor/profile");
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editPasswordProfile = async (req, res) => {
  try {
    const { user } = req;
    let isErrorsPass = false;
    const { newPassword, currentPassword, confirmPassword } = req.body;
    if (user.firstChangePass) {
      if (newPassword != "" && confirmPassword != "" && currentPassword != "") {
        if (currentPassword === user.newPassword) {
          if (newPassword === confirmPassword) {
            await userModel.updateOne(
              { _id: user._id },
              {
                newPassword,
              }
            );
          } else {
            isErrorsPass = true;
            const messError =
              "Mật khẩu mới và mật khẩu xác thực phải giống nhau.";
            res.render("home/profile", { user, isErrorsPass, messError });
          }
        } else {
          isErrorsPass = true;
          const messError = "Mật khẩu hiện tại không đúng.";
          res.render("home/profile", { user, isErrorsPass, messError });
        }
      } else {
        isErrorsPass = true;
        const messError =
          "Mật khẩu mới, mật khẩu xác thực hoặc mật khẩu hiện tại không dược trống.";
        res.render("home/profile", { user, isErrorsPass, messError });
      }
    } else {
      const firstChangePass = true;
      if (newPassword != "" && confirmPassword != "") {
        if (newPassword === confirmPassword) {
          await userModel.updateOne(
            { _id: user._id },
            {
              newPassword,
              firstChangePass,
            }
          );
        } else {
          isErrorsPass = true;
          const messError =
            "Mật khẩu mới và mật khẩu xác thực phải giống nhau.";
          res.render("home/profile", { user, isErrorsPass, messError });
        }
      } else {
        isErrorsPass = true;
        const messError =
          "Mật khẩu mới hoặc mật khẩu xác thực không được trống.";
        res.render("home/profile", { user, isErrorsPass, messError });
      }
    }
    if (isErrorsPass == false) {
      res.redirect("/editor/profile");
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
