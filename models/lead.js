const mongoose = require("mongoose");
const validator = require("validator");
const { v4: uuidv4 } = require('uuid');
const leadSchema = new mongoose.Schema({
    fullname: String,
    email: {
        type: String, 
        validate: [validator.isEmail, "Please provide email"]
    },
    mobile: {
        type: Number,
    },
    city: String,
    gender: {
        type: String,
        enum: ['male', 'female', 'others'],
        default: 'male'
    },
    department: {
        type: String
    },
    delete: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost', 'cancelled', 'confirmed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'low'
    },
    source: {
        type: String,
        lowercase: true,
        enum: ['email', 'phone'],
        default: 'email'
    },
    createdDate: {
        type: Date, 
        default: Date.now()
    },
    updatedDate: {
        type: Date, 
        default: Date.now()
    },
    
    companyname :{ type: String,default: 'self'},
    description: String, 
    assignedTo: { type: String,default: 'None'},
});


const Lead = mongoose.model('Lead', leadSchema, 'leads');

module.exports = Lead;
