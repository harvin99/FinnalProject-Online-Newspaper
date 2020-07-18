const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const postSchema = new mongoose.Schema(
  {
    title: String,
    abstract: String,
    detail: String,
    author: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    userLike: [],
    userDislike: [],
    view: Number,
    tags: [],
    catId: String,
    status: String,
    comments: [],
    isPremium: Boolean,
    avatarPostUrl: String,
    slugPost: String,
    //timePost : Date
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, timestamps: true }
);
postSchema.virtual("commentCount").get(function (v) {
  console.log("rubn");
  return this.comments.length;
});
postSchema.plugin(mongooseLeanVirtuals);
const Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;
