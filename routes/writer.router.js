const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  writerController,
  uploadController,
  userController,
} = require("../controllers");
const { addPostValidator } = require("../validator");
const { needRole } = require("./../middlewares/auth.mdw");
router.get("/", needRole("writer"), writerController.getPost);
router.get("/profile", needRole("writer"), userController.getProfile);
router.post(
  "/profile/editname",
  needRole("writer"),
  userController.editNameProfile
);
router.post(
  "/profile/editdob",
  needRole("writer"),
  userController.editDoBProfile
);
router.post(
  "/profile/editavatar",
  needRole("writer"),
  uploadController.uploadImage.single("avatar"),
  userController.editNameAvatar
);
router.post(
  "/profile/editpassword",
  needRole("writer"),
  userController.editPasswordProfile
);
router.get("/posts/add", needRole("writer"), writerController.addPost);
router.post(
  "/posts/add",
  needRole("writer"),

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  writerController.addPost_post
);
router.get("/posts/edit/:slug", needRole("writer"), writerController.editPost);
router.post(
  "/posts/edit/:slug",
  needRole("writer"),

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  writerController.editPost_post
);
router.get("/posts/:slug/del", needRole("writer"), writerController.delPost);
router.post(
  "/posts/upload-image",
  needRole("writer"),
  uploadController.uploadImage.single("file"),
  uploadController.uploadPostImage
);
module.exports = router;
