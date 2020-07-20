const express = require("express");
const router = express.Router();
const passport = require("passport");
const { writerController, uploadController } = require("../controllers");
const { addPostValidator } = require("../validator");

router.get("/", writerController.getPost);
router.get("/posts/add", writerController.addPost);
router.post(
  "/posts/add",

  uploadController.uploadImage.single("avatar"),
  addPostValidator(),
  writerController.addPost_post
);
router.get("/posts/:slug/del", writerController.delPost);

module.exports = router;
