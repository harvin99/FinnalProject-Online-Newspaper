const express = require("express");
const router = express.Router();
const { uploadController, userController } = require("../controllers");
const { needRole } = require("./../middlewares/auth.mdw");
router.get("/", needRole("Normal"), userController.getProfile);
router.get("/profile", needRole("Normal"), userController.getProfile);
router.post(
  "/profile/editname",
  needRole("Normal"),
  userController.editNameProfile
);
router.post(
  "/profile/editdob",
  needRole("Normal"),
  userController.editDoBProfile
);
router.post(
  "/profile/editavatar",
  needRole("Normal"),
  uploadController.uploadImage.single("avatar"),
  userController.editNameAvatar
);
router.post(
  "/profile/editpassword",
  needRole("Normal"),
  userController.editPasswordProfile
);
router.get("/paypremium", needRole("Normal"), userController.payPremium);
router.post(
  "/paypremium/:time",
  needRole("Normal"),
  userController.payPremium_post
);
module.exports = router;
