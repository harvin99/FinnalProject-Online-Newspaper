const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    nameTag : String,
    slugTag : String,
})
const Tag = mongoose.model('Tag', tagSchema, 'tags')

module.exports = Tag