const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const postStatusEnum = [
  "NotPublished",
  "Denied",
  "WaitingForPublication",
  "Published",
];
const postSchema = new mongoose.Schema(
  {
    title: String,
    abstract: String,
    content: String,
    author: {},
    like: [],
    dislike: [],
    view: {
      type: Number,
      default: 0,
    },
    tags: [],
    category: {},
    status: {
      type: String,
      enum: postStatusEnum,
      default: postStatusEnum[0],
    },
    comments: [],
    isPremium: Boolean,
    avatar: String,
    slug: String,
    reason: String,
    timePost : Date
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, timestamps: true }
);
//index
postSchema.index(
  { title: "text", abstract: "text", content: "text" },
  { name: "post_fts_index" }
);
postSchema.virtual("commentCount").get(function (v) {
  return this.comments.length;
});
postSchema.plugin(mongooseLeanVirtuals);
postSchema.statics = {
  postStatusEnum,
};
const Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;
