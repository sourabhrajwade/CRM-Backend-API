
const mongoose = require("mongoose");
const validator = require("validator");


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


const Contacts = mongoose.model('Contacts', contactSchema, 'contacts');

module.exports = Contacts;