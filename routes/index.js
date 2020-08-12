const express = require("express");
const router = express.Router();

const homeRouter = require("./home.router");
const writerRouter = require("./writer.router");
const adminRouter = require("./admin.router");
const editorRouter = require("./editor.router");
const userRouter = require("./user.router");
const formRouter = require("./form.router");

const useLayout = (layout) => (req, res, next) => {
  req.app.locals.layout = layout; // set your layout here
  next(); // pass control to the next handler
};

router.use("/", useLayout("main"), homeRouter);
router.use("/writer", useLayout("admin"), writerRouter);
router.use("/admin", useLayout("admin"), adminRouter);
router.use("/editor", useLayout("admin"), editorRouter);
router.use("/normal", useLayout("admin"), userRouter);
router.use("/form", useLayout("form"), formRouter);

module.exports = router;
