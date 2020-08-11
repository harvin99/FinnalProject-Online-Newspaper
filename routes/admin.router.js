const express = require("express");
const router = express.Router();
const passport = require("passport");
const { adminController, uploadController } = require("../controllers");
const { addCategoryValidator, addTagValidator } = require("../validator");
const { needRole } = require("../middlewares/auth.mdw");
const categoryRouter = require("./admin/category.admin.router");
const tagRouter = require("./admin/tag.admin.router");
const postRouter = require("./admin/post.admin.router");
const userRouter = require("./admin/user.admin.router");

router.get("/", needRole("admin"), adminController.dashboard);
router.use("/categories", categoryRouter);
router.use("/tags", tagRouter);
router.use("/posts", postRouter);
router.use("/users", userRouter);
module.exports = router;
