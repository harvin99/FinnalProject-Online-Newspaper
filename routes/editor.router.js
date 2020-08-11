const express = require("express");
const router = express.Router();
const { editorController } = require("../controllers");
const { needRole } = require("./../middlewares/auth.mdw");

router.get("/", needRole("editor"), editorController.getCategories);
router.get("/:slug", needRole("editor"), editorController.getPosts);
router.get("/:slug/denial", needRole("editor"), editorController.denialPost);
router.post("/:slug/denial", needRole("editor"), editorController.denialPost_post);
router.get("/:slug/accept", needRole("editor"), editorController.acceptPost);
router.post("/:slug/accept", needRole("editor"), editorController.acceptPost_post);
router.get("/:slug/cancel", needRole("editor"), editorController.cancelPost);
module.exports = router;