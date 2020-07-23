const homeController = require("./home.controller");
const writerController = require("./writer.controller");
const uploadController = require("./upload.controller");
const adminController = require("./admin.controller");
console.log(adminController);
module.exports = {
  homeController,
  writerController,
  uploadController,
  adminController,
};
