const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  slug: String,
  subCategories: [],
});
categorySchema.statics = {
  findSubCategory: async function name(slug) {
    let rootCategory = await this.findOne({
      subCategories: {
        $elemMatch: {
          slug,
        },
      },
    }).lean();
    if (rootCategory) {
      let [subCategory] =
        rootCategory.subCategories.filter((i) => i.slug === slug) || [];
      return subCategory;
    }
    return null;
  },
};
// categorySchema.methods.findSubCategory = function (slug) {
//   console.log(this, slug);
// };
const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
