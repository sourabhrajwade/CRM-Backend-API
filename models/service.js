
const mongoose = require("mongoose");


const serviceSchema = mongoose.Schema({
  title: { type: String, required: true },
  categories: { type: String, required: true },
  description: { type: String, required: true },
  created_on: { type: Date, default: Date.now() },
  assignmed_to: { type: mongoose.Types.ObjectId, ref: "user" },
  status: {
    type: String,
    enum: [
      "created",
      "open",
      "released",
      "cancelled",
      "in_process",
      "completed",
    ],
    default: "created",
  },
  updated_on: { type: Date },
});

const Service = mongoose.model("Service", serviceSchema, "service");

module.exports = Service;
