const express = require("express");
const router = express.Router();
const { editorController, uploadController } = require("../controllers");
const { needRole } = require("./../middlewares/auth.mdw");
router.get("/", needRole("editor"), editorController.getCategories);
router.get("/profile", needRole("editor"), editorController.getProfile);
router.post(
  "/profile/editname",
  needRole("editor"),
  editorController.editNameProfile
);
router.post(
  "/profile/editdob",
  needRole("editor"),
  editorController.editDoBProfile
);
router.post(
  "/profile/editavatar",
  needRole("editor"),
  uploadController.uploadImage.single("file"),
  editorController.editNameAvatar
);
router.post(
  "/profile/editpassword",
  needRole("editor"),
  editorController.editPasswordProfile
);
router.get("/:slug", needRole("editor"), editorController.getPosts);
router.get("/:slug/denial", needRole("editor"), editorController.denialPost);
router.post(
  "/:slug/denial",
  needRole("editor"),
  editorController.denialPost_post
);
router.get("/:slug/accept", needRole("editor"), editorController.acceptPost);
router.post(
  "/:slug/accept",
  needRole("editor"),
  editorController.acceptPost_post
);
router.get("/:slug/cancel", needRole("editor"), editorController.cancelPost);
module.exports = router;
