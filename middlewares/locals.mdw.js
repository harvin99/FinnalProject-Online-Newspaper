const LRU = require("lru-cache");
const { categoryModel, tagModel } = require("./../models");
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
    if (!allCategories) {
      allCategories = await categoryModel.find().lean();

      cache.set("allCategories", allCategories);
    }
    if (!tags) {
      tags = await tagModel.find().lean();
      cache.set("tags", tags);
    }
    res.locals.allCategories = allCategories;
    res.locals.tags = tags;
    next();
  });
};
