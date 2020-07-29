const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: String,
  slug: String,
});
const Tag = mongoose.model("Tag", tagSchema, "tags");

module.exports = Tag;
