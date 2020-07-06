const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    nameTag : String
})
const Tag = mongoose.model('Tag', tagSchema, 'tags')

module.exports = Tag