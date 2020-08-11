const express = require("express");
const router = express.Router();
const formController = require("../controllers/form.controller");
router.get("/forget", formController.forget);
router.post("/forget", formController.forget_post);
router.get("/resetpassword/:token", formController.resetpassword);
router.post("/resetpassword/:token", formController.resetpassword_post);
module.exports = router;
