const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'admin'
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
    password: {
        type: String,
        required: [true, 'Please tell us your password!']
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    }
})

const Admin = mongoose.model('Admin', adminSchema, 'admin');

module.exports = Admin;