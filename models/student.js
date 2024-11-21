const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        rrequired: [true, 'Email is required'],
        unique: true
    },
    name: { type: String, required: true },
    Class: { type: String, required: true },
    rollno: { type: String, required: true },
    dob: { type: Date, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    profilePicture: { type: String },
});

module.exports = mongoose.model('Student', studentSchema);
