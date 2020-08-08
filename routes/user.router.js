const express = require("express");
const router = express.Router();
const { uploadController, userController } = require("../controllers");
const { needRole } = require("./../middlewares/auth.mdw");
router.get("/", needRole("user"), userController.getProfile);
router.get("/profile", needRole("user"), userController.getProfile);
router.post(
  "/profile/editname",
  needRole("user"),
  userController.editNameProfile
);
router.post(
  "/profile/editdob",
  needRole("user"),
  userController.editDoBProfile
);
router.post(
  "/profile/editavatar",
  needRole("user"),
  uploadController.uploadImage.single("avatar"),
  userController.editNameAvatar
);
router.post(
  "/profile/editpassword",
  needRole("user"),
  userController.editPasswordProfile
);
module.exports = router;
