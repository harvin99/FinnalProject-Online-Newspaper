const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const tagSchema = new mongoose.Schema({
  name: String,
  slug: {
    type: String,
    slug: "name",
    slugPaddingSize: 4,
    unique: true,
    sparse: true,
  },
});
tagSchema.index({ name: "text" });
const Tag = mongoose.model("Tag", tagSchema, "tags");

module.exports = Tag;
