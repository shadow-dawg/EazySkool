const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/miniproject');

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['Student', 'Teacher'],
    },
    profilePicture: {
        type: String,
        default: "default.png"
    }
})

module.exports = mongoose.model('user', userSchema);
   