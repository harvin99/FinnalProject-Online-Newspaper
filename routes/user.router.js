const express = require("express");
const router = express.Router();
const { uploadController, userController } = require("../controllers");
const { needRole } = require("./../middlewares/auth.mdw");
router.get("/", needRole("normal"), userController.getProfile);
router.get("/profile", needRole("normal"), userController.getProfile);
router.post(
  "/profile/editname",
  needRole("normal"),
  userController.editNameProfile
);
router.post(
  "/profile/editdob",
  needRole("normal"),
  userController.editDoBProfile
);
router.post(
  "/profile/editavatar",
  needRole("normal"),
  uploadController.uploadImage.single("avatar"),
  userController.editNameAvatar
);
router.post(
  "/profile/editpassword",
  needRole("normal"),
  userController.editPasswordProfile
);
router.get("/paypremium", needRole("normal"), userController.payPremium);
router.post(
  "/paypremium/:time",
  needRole("normal"),
  userController.payPremium_post
);
module.exports = router;
