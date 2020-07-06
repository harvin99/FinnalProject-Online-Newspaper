const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title : String,
    abstract : String,
    detail : String,
    author : String,
    userLike : [],
    userDislike : [],
    view : Number,
    tags : [],
    catId : String,
    status : String,
    comments : [],
    isPremium : Boolean,
    avatarPostUrl : String,
    slugPost : String
    //timePost : Date
})
const Post = mongoose.model('Post', postSchema, 'posts')

module.exports = Post