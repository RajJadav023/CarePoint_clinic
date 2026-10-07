const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  gender: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 1 },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^\d{10}$/.test(value),
      message: "Phone must contain exactly 10 digits."
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Patient", patientSchema);
