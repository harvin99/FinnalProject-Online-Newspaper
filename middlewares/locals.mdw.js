const LRU = require("lru-cache");
const { categoryModel, tagModel, postModel } = require("./../models");
const moment = require("moment");
const cache = new LRU({
  max: 500,
  maxAge: 1000 * 60,
});
module.exports = function (app) {
  app.use(async function (req, res, next) {
    let { user } = req;
    res.locals.user = user;
    next();
  });
  app.use(async function (req, res, next) {
    let allCategories = cache.get("allCategories");
    let tags = cache.get("tags");
    let trendingPosts = cache.get("trendingPosts");
    if (!allCategories) {
      allCategories = await categoryModel.find().lean();

      cache.set("allCategories", allCategories);
    }
    if (!tags) {
      tags = await tagModel.find().lean();
      cache.set("tags", tags);
    }
    if (!trendingPosts) {
      trendingPosts = await postModel
        .find({
          status: "Published",
          timePost: {
            $gte: moment().subtract(7, "days").toDate(),
          },
        })
        .limit(4)
        .lean({ virtuals: true });
      trendingPosts = trendingPosts.sort((a, b) => b.score - a.score);
    }
    res.locals.allCategories = allCategories;
    res.locals.tags = tags;
    res.locals.trendingPosts = trendingPosts;
    res.locals.now = new Date();
    next();
  });
};
