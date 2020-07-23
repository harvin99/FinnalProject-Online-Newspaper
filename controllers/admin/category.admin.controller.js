const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../../validator");
const {
  userModel,
  postModel,
  categoryModel,
  tagModel,
} = require("../../models");
const { getFilePath } = require("../upload.Controller");
const config = require("../../config");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { jsHelper } = require("../../utils");

module.exports.getCategories = async (req, res) => {
  try {
    let showMessageModal = null;
    let view = "admin/categories/categories";
    let { delCategory, addCategory, editCategory } = req.session;
    if (delCategory) {
      if (delCategory.errors) {
        showMessageModal = {
          type: "danger",
          title: "Delete Category",
          message: delCategory.errors,
        };
      } else if (delCategory.success) {
        showMessageModal = {
          type: "success",
          title: "Delete Category",
          message: "Delete category successfull",
        };
      }

      req.session.delCategory = null;
    }
    if (addCategory) {
      if (addCategory.errors) {
        showMessageModal = {
          type: "danger",
          title: "Add Category",
          message: addCategory.errors,
        };
      } else if (addCategory.success) {
        showMessageModal = {
          type: "success",
          title: "Add Category",
          message: "Add category successfull",
        };
      }
      req.session.addCategory = null;
    }
    if (editCategory) {
      if (editCategory.errors) {
        showMessageModal = {
          type: "danger",
          title: "Edit Category",
          message: editCategory.errors,
        };
      } else if (editCategory.success) {
        showMessageModal = {
          type: "success",
          title: "Edit Category",
          message: "Edit category successfull",
        };
      }
      req.session.editCategory = null;
    }
    let categories = await categoryModel.find().lean({ virtuals: true });
    res.render(view, {
      categories,
      activeFeature: 2,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.getCategory = async (req, res) => {
  let { slug } = req.params;
  try {
    let showMessageModal = null;
    let view = "admin/categories/category";
    if (!slug) {
      throw new Error("Category Not Found");
    }
    let category = await categoryModel
      .findOne({ slug })
      .lean({ virtuals: true });
    if (!category) {
      throw new Error("Category Not Found");
    }
    res.render(view, {
      category,
      activeFeature: 2,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addCategory = async (req, res) => {
  try {
    let showMessageModal = null;
    let view = "admin/categories/addCategory";

    res.render(view, {
      activeFeature: 2,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addCategory_post = async (req, res) => {
  let { name, customSlug, subCategories } = req.body;
  let selectedSubCategories = subCategories;
  subCategories = subCategories.map((name) => ({
    name,
    slug: jsHelper.generateSlug(name),
  }));
  try {
    let showMessageModal = null;
    let view = "admin/categories/addCategory";

    let formError = validationResult(req);
    if (formError.isEmpty()) {
      console.log("run");
      let newCategory = new categoryModel({
        name,
        slug: customSlug || jsHelper.generateSlug(name),
        subCategories,
      });
      await newCategory.save();
      req.session.addCategory = {
        success: true,
      };
      res.redirect("/admin/categories");
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      console.log(formError);
      res.render(view, {
        name,
        customSlug,
        selectedSubCategories,
        subCategories,
        activeFeature: 2,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editCategory = async (req, res) => {
  let { slug } = req.params;
  try {
    let showMessageModal = null;
    let view = "admin/categories/editCategory";
    if (!slug) {
      throw new Error("Category Not Found");
    }
    let category = await categoryModel
      .findOne({ slug })
      .lean({ virtuals: true });
    if (!category) {
      throw new Error("Category Not Found");
    }
    let { name, slug: customSlug, subCategories } = category;
    selectedSubCategories = subCategories.map((i) => i.slug);

    res.render(view, {
      name,
      customSlug,
      selectedSubCategories,
      subCategories,
      activeFeature: 2,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editCategory_post = async (req, res) => {
  let { slug } = req.params;
  let { name, customSlug, subCategories } = req.body;
  let selectedSubCategories = subCategories;
  subCategories = subCategories.map((name) => ({
    name,
    slug: jsHelper.generateSlug(name),
  }));
  console.log(subCategories);
  try {
    let showMessageModal = null;
    let view = "admin/categories/editCategory";
    let updateCategory = await categoryModel.findOne({ slug });
    if (!updateCategory) {
      throw new Error("Category not found");
    }
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      updateCategory.name = name;
      updateCategory.slug = customSlug || jsHelper.generateSlug(name);
      updateCategory.subCategories = subCategories;
      await updateCategory.save();
      req.session.editCategory = {
        success: true,
      };
      res.redirect("/admin/categories");
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      console.log(subCategories);
      console.log(formError);
      res.render(view, {
        formError,
        name,
        customSlug,
        selectedSubCategories,
        subCategories,
        activeFeature: 2,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delCategory = async (req, res) => {
  let { user } = req;
  let { slug } = req.params;
  try {
    let category = await categoryModel.findOneAndDelete({
      slug,
    });

    if (category) {
      req.session.delCategory = {
        success: true,
      };
    } else {
      req.session.delCategory = {
        errors: "Category not found",
      };
    }
  } catch (error) {
    req.session.delCategory = {
      errors: error.toString(),
    };
  } finally {
    console.log(req.originalUrl);
    res.redirect("/admin/categories");
  }
};
