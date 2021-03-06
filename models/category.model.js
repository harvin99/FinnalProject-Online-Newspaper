const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const categorySchema = new mongoose.Schema({
  name: String,
  slug: {
    type: String,
    slug: "name",
    slugPaddingSize: 4,
    unique: true,
    sparse: true,
  },
  subCategories: [
    {
      name: String,
      slug: {
        type: String,
        slug: "name",
        index: true,
        slugPaddingSize: 4,
        unique: true,
        sparse: true,
      },
    },
  ],
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
  findAllSubCategories: async function name(slug) {
    let rootCategories = (await this.find().lean()) || [];

    return [].concat(...rootCategories.map((i) => i.subCategories));
  },
};
// categorySchema.methods.findSubCategory = function (slug) {
//
// };
const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
