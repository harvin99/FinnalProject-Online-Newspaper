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

module.exports.getTags = async (req, res) => {
  let { page = 1, perPage = 2, q, status } = req.query;
  try {
    let showMessageModal = null;
    let view = "admin/tags/tags";
    let { delTag, addTag, editTag } = req.session;
    if (delTag) {
      if (delTag.errors) {
        showMessageModal = {
          type: "danger",
          title: "Delete Tag",
          message: delTag.errors,
        };
      } else if (delTag.success) {
        showMessageModal = {
          type: "success",
          title: "Delete Tag",
          message: "Delete tag successfull",
        };
      }

      req.session.delTag = null;
    }
    if (addTag) {
      if (addTag.errors) {
        showMessageModal = {
          type: "danger",
          title: "Add Tag",
          message: addTag.errors,
        };
      } else if (addTag.success) {
        showMessageModal = {
          type: "success",
          title: "Add Tag",
          message: "Add tag successfull",
        };
      }
      req.session.addTag = null;
    }
    if (editTag) {
      if (editTag.errors) {
        showMessageModal = {
          type: "danger",
          title: "Edit Tag",
          message: editTag.errors,
        };
      } else if (editTag.success) {
        showMessageModal = {
          type: "success",
          title: "Edit Tag",
          message: "Edit tag successfull",
        };
      }
      req.session.editTag = null;
    }
    let findObj = {};
    if (q) {
      findObj.$text = {
        $search: q,
      };
    }
    let tags = await tagModel
      .find(findObj)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean({ virtuals: true });
    let totalTag = (await tagModel.countDocuments(findObj)) || 1;
    res.render(view, {
      q,
      tags,
      activeFeature: 3,
      showMessageModal,
      pagination: {
        page,
        pageCount: totalTag / perPage,
      },
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.getTag = async (req, res) => {
  let { slug } = req.params;
  try {
    let showMessageModal = null;
    let view = "admin/tags/tag";
    if (!slug) {
      throw new Error("Tag Not Found");
    }
    let tag = await tagModel.findOne({ slug }).lean({ virtuals: true });
    if (!tag) {
      throw new Error("Tag Not Found");
    }
    res.render(view, {
      tag,
      activeFeature: 3,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addTag = async (req, res) => {
  try {
    let showMessageModal = null;
    let view = "admin/tags/addTag";

    res.render(view, {
      activeFeature: 3,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.addTag_post = async (req, res) => {
  let { name, customSlug } = req.body;

  try {
    let showMessageModal = null;
    let view = "admin/tags/addTag";

    let formError = validationResult(req);
    if (formError.isEmpty()) {
      let newTag = new tagModel({
        name,
        slug: customSlug || jsHelper.generateSlug(name),
      });
      await newTag.save();
      req.session.addTag = {
        success: true,
      };
      res.redirect("/admin/tags");
    } else {
      formError = formError.formatWith(errorFormatter).mapped();

      res.render(view, {
        name,
        customSlug,
        activeFeature: 3,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.editTag = async (req, res) => {
  let { slug } = req.params;
  try {
    let showMessageModal = null;
    let view = "admin/tags/editTag";
    if (!slug) {
      throw new Error("Tag Not Found");
    }
    let tag = await tagModel.findOne({ slug }).lean({ virtuals: true });
    if (!tag) {
      throw new Error("Tag Not Found");
    }
    let { name, slug: customSlug } = tag;

    res.render(view, {
      name,
      customSlug,
      activeFeature: 3,
      showMessageModal,
    });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editTag_post = async (req, res) => {
  let { slug } = req.params;
  let { name, customSlug } = req.body;

  try {
    let showMessageModal = null;
    let view = "admin/tags/editTag";
    let updateTag = await tagModel.findOne({ slug });
    if (!updateTag) {
      throw new Error("Tag not found");
    }
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      updateTag.name = name;
      updateTag.slug = customSlug || jsHelper.generateSlug(name);

      await updateTag.save();
      req.session.editTag = {
        success: true,
      };
      res.redirect("/admin/tags");
    } else {
      formError = formError.formatWith(errorFormatter).mapped();

      res.render(view, {
        formError,
        name,
        customSlug,

        activeFeature: 3,
      });
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
module.exports.delTag = async (req, res) => {
  let { user } = req;
  let { slug } = req.params;
  try {
    let tag = await tagModel.findOneAndDelete({
      slug,
    });

    if (tag) {
      req.session.delTag = {
        success: true,
      };
    } else {
      req.session.delTag = {
        errors: "Tag not found",
      };
    }
  } catch (error) {
    req.session.delTag = {
      errors: error.toString(),
    };
  } finally {
    res.redirect("/admin/tags");
  }
};
