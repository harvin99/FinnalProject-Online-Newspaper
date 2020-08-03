const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    content : String,
    author : String,
    //dateComment : Date
})
const Comment = mongoose.model('Comment', commentSchema, 'comments')

module.exports = Comment