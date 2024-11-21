const mongoose = require('mongoose');

const subSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        //unique: true
    },
    science: { 
        type: Number, 
        required: false,
        default: 0 
    },
    maths: { 
        type: Number,
        required: false,
        default: 0 
    },
    socialscience: {
        type: Number,
        required: false,
        default: 0 
    },
    english: { 
        type: Number,
        required: false,
        default: 0 
    },
    TotalMarks: { 
        type: Number,
        required: false
    },
});

module.exports = mongoose.model('subject', subSchema);
