const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title : String,
    abstract : String,
    detail : String,
    author : String,
    like : Number,
    view : Number,
    tagId :String,
    catId : String,
    status : String,
    commentId : String,
    isPremium : Boolean,
    avatarPostUrl : String
    //timePost : Date
})
const Post = mongoose.model('Post', postSchema, 'posts')

module.exports = Post