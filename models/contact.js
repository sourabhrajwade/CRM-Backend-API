const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
      type: Number,
      required: [true, "Please tell us your email!"],
      unique: true
  },
  description: String,
  created_at: Date,
  updated_at: Date,
  id: Number
});


const Contact = mongoose.model('Contact', contactSchema, 'contacts');

module.exports = Contact;