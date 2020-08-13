const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  writerController,
  uploadController,
  adminController,
} = require("../../controllers");
const { addPostValidator } = require("../../validator");
const { needRole } = require("../../middlewares/auth.mdw");
router.get("/", needRole("admin"), adminController.getPost);
router.get("/add", needRole("admin"), adminController.addPost);
router.post(
  "/add",
  needRole("admin"),

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  adminController.addPost_post
);
router.get("/edit/:slug", needRole("admin"), adminController.editPost);
router.post(
  "/edit/:slug",
  needRole("admin"),

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  adminController.editPost_post
);
router.get("/:slug/del", needRole("admin"), adminController.delPost);
router.get("/:slug/publish", needRole("admin"), adminController.publishPost);
router.get("/:slug/draft", needRole("admin"), adminController.draftPost);
router.post(
  "/upload-image",
  needRole("admin"),
  uploadController.uploadImage.single("file"),
  uploadController.uploadPostImage
);
module.exports = router;
