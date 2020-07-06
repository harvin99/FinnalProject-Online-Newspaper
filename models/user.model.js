const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullName : String,
    email : String,
    userName : String,
    passWord : String,
    DoB : Date,
    role: String,
    expire : Date,
    manager : String,
    pseudonym : String,
    isAdmin : Boolean
})
const User = mongoose.model('User', userSchema, 'users')

module.exports = User