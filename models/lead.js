const mongoose = require("mongoose");
const validator = require("validator");

const leadSchema = new mongoose.Schema({
    requester_id: {
        type: Number
    },
    email: {
        type: String, 
        validate: [validator.isEmail, "Please provide email"]
    },
    phone: {
        type: Number,
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
    companyName : String,
    description: String, 
});


const Lead = mongoose.model('Lead', leadSchema, 'leads');

module.exports = Lead;
