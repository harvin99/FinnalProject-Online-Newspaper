const express = require("express");
const router = express.Router();

const homeRouter = require("./home.router");

const useLayout = (layout) => (req, res, next) => {
  req.app.locals.layout = layout; // set your layout here

  next(); // pass control to the next handler
};
router.use("/", homeRouter);

module.exports = router;
