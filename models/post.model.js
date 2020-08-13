const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const moment = require("moment");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

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
    slug: {
      type: String,
      slug: "title",
      slugPaddingSize: 4,
      unique: true,
      sparse: true,
    },
    timePost: Date,
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, timestamps: true }
);
//index
postSchema.index(
  { title: "text", abstract: "text", content: "text" },
  { name: "post_fts_index" }
);
postSchema.virtual("commentCount").get(function (v) {
  return this.comments.length || 0;
});
postSchema.virtual("score").get(function (v) {
  let viewScore = this.view * 1;
  let likeScore = this.like.length * 3;
  let commentScore = this.comments.length * 5;
  let dateScore = Math.round(
    moment(this.timePost).diff(moment().subtract(7, "days"), "minutes") / 100
  );
  let premiumScore = this.isPremium ? 100 : 0;
  return viewScore + likeScore + commentScore + dateScore + premiumScore;
});
postSchema.plugin(mongooseLeanVirtuals);
postSchema.statics = {
  postStatusEnum,
};
const Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;
