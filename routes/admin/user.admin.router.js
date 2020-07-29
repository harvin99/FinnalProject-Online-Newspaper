const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  writerController,
  uploadController,
  adminController,
} = require("../../controllers");
const { registerValidator, addUserValidator } = require("../../validator");
const { needRole } = require("../../middlewares/auth.mdw");
router.get("/", needRole("admin"), adminController.getUsers);
router.get("/add", needRole("admin"), adminController.addUser);
router.post(
  "/add",
  needRole("admin"),

  uploadController.uploadImage.single("avatar"),
  addUserValidator(),
  adminController.addUser_post
);
router.get("/edit/:username", needRole("admin"), adminController.editUser);
router.post(
  "/edit/:username",
  needRole("admin"),

  uploadController.uploadImage.single("avatar"),
  addUserValidator(),
  adminController.editUser_post
);
router.get("/:username/del", needRole("admin"), adminController.delUser);
router.post(
  "/upload-image",
  needRole("admin"),
  uploadController.uploadImage.single("file"),
  uploadController.uploadUserImage
);
router.get("/:username", needRole("admin"), adminController.getUser);
module.exports = router;
