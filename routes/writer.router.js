const express = require("express");
const router = express.Router();
const passport = require("passport");
const { writerController, uploadController } = require("../controllers");
const { addPostValidator } = require("../validator");
const {needRole} = require("./../middlewares/auth.mdw")
router.get("/",needRole("writer"), writerController.getPost);
router.get("/posts/add",needRole("writer"), writerController.addPost);
router.post(
  "/posts/add",needRole("writer"),

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  writerController.addPost_post
);
router.get("/posts/edit/:slug",needRole("writer"), writerController.editPost);
router.post(
  "/posts/edit/:slug",needRole("writer"),

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  writerController.editPost_post
);
router.get("/posts/:slug/del",needRole("writer"), writerController.delPost);

module.exports = router;
