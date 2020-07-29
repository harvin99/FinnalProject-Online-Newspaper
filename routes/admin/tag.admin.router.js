const express = require("express");
const router = express.Router();
const passport = require("passport");
const { adminController, uploadController } = require("../../controllers");
const { addCategoryValidator, addTagValidator } = require("../../validator");
const { needRole } = require("../../middlewares/auth.mdw");

router.get("/", needRole("admin"), adminController.getTags);

router.get("/add", needRole("admin"), adminController.addTag);
router.post(
  "/add",
  needRole("admin"),
  addTagValidator(),
  adminController.addTag_post
);

router.get("/edit/:slug", needRole("admin"), adminController.editTag);
router.post(
  "/edit/:slug",
  needRole("admin"),
  addTagValidator(),
  adminController.editTag_post
);

router.get("/:slug/del", needRole("admin"), adminController.delTag);
module.exports = router;
