const multer = require("multer");
var path = require("path");
const moment = require("moment");
const { categoryModel, tagModel, postModel } = require("../models");
const postConfig = require("../config").post;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
var uploadImage = multer({ storage: storage });
const getFilePath = (file) =>
  file ? `${file.destination.slice(6)}/${file.filename}` : "";
module.exports = {
  uploadPostImage: async (req, res) => {
    req.file
      ? res.json({ location: getFilePath(req.file) })
      : res.json({ errors: "file not found" });
  },
  uploadImage,
  getFilePath,
};
