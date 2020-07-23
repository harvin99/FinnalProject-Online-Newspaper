const express = require("express");
const router = express.Router();

const homeRouter = require("./home.router");
const writerRouter = require("./writer.router");
const adminRouter = require("./admin.router");
console.log(adminRouter);
const useLayout = (layout) => (req, res, next) => {
  req.app.locals.layout = layout; // set your layout here

  next(); // pass control to the next handler
};
router.use("/", homeRouter);
router.use("/writer", useLayout("admin"), writerRouter);
router.use("/admin", useLayout("admin"), adminRouter);
module.exports = router;
