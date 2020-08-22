const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
    default: 'Nil'
  },
  email: {
    type: String,
    required: [true, "Please tell us your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
    default: 'Nil'
  },
  phone: {
    type: Number,
    required: [true, "Please tell us your email!"],
    unique: true,
    default: 0
  },
  description: String,

  updated_at: { type: Date, default: Date.now() },
  
},{ timestamps: { createdAt: 'created_at' }});

const Contacts = mongoose.model("Contacts", contactSchema, "contacts");

module.exports = Contacts;
