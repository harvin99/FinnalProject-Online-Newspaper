const express = require("express");
const router = express.Router();
const passport = require("passport");
const { adminController, uploadController } = require("../../controllers");
const { addCategoryValidator, addTagValidator } = require("../../validator");
const { needRole } = require("../../middlewares/auth.mdw");

//categories
router.get("/", needRole("admin"), adminController.getCategories);

router.get("/add", needRole("admin"), adminController.addCategory);
router.post(
  "/add",
  needRole("admin"),
  addCategoryValidator(),
  adminController.addCategory_post
);

router.get("/edit/:slug", needRole("admin"), adminController.editCategory);
router.post(
  "/edit/:slug",
  needRole("admin"),
  addCategoryValidator(),
  adminController.editCategory_post
);

router.get("/:slug/del", needRole("admin"), adminController.delCategory);
module.exports = router;
