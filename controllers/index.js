const homeController = require("./home.controller");
const writerController = require("./writer.controller");
const uploadController = require("./upload.controller");
const editorController = require('./editor.controller');
const adminController = require("./admin.controller");
const userController = require("./user.controller");

module.exports = {
  homeController,
  writerController,
  editorController,
  uploadController,
  adminController,
  userController,
};
