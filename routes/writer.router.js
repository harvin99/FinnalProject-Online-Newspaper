const express = require("express");
const router = express.Router();
const passport = require("passport");
const { writerController } = require("../controllers");
const { loginValidator, registerValidator } = require("../validator");

router.get("/", writerController.getPost);
router.get("/posts/:slug/del", writerController.delPost);
module.exports = router;
