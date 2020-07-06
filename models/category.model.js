const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    nameCategory : String,
    slugCategory : String,
    subCategory : []
})
const Category = mongoose.model('Category', categorySchema, 'categories')

module.exports = Category