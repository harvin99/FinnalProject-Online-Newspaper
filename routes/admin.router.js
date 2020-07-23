const express = require("express");
const router = express.Router();
const passport = require("passport");
const { adminController, uploadController } = require("../controllers");
const { addCategoryValidator, addTagValidator } = require("../validator");
const { needRole } = require("../middlewares/auth.mdw");
router.get("/", needRole("admin"), adminController.dashboard);
//categories
router.get("/categories", needRole("admin"), adminController.getCategories);

router.get("/categories/add", needRole("admin"), adminController.addCategory);
router.post(
  "/categories/add",
  needRole("admin"),
  addCategoryValidator(),
  adminController.addCategory_post
);

router.get(
  "/categories/edit/:slug",
  needRole("admin"),
  adminController.editCategory
);
router.post(
  "/categories/edit/:slug",
  needRole("admin"),
  addCategoryValidator(),
  adminController.editCategory_post
);

router.get(
  "/categories/:slug/del",
  needRole("admin"),
  adminController.delCategory
);
//tags

router.get("/tags", needRole("admin"), adminController.getTags);

router.get("/tags/add", needRole("admin"), adminController.addTag);
router.post(
  "/tags/add",
  needRole("admin"),
  addTagValidator(),
  adminController.addTag_post
);

router.get("/tags/edit/:slug", needRole("admin"), adminController.editTag);
router.post(
  "/tags/edit/:slug",
  needRole("admin"),
  addTagValidator(),
  adminController.editTag_post
);

router.get("/tags/:slug/del", needRole("admin"), adminController.delTag);
module.exports = router;
