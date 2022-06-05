const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    },
    isadmin: {
        type: Number,
        required:true,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)