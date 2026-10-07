const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => /^\d{10}$/.test(value),
      message: "Phone must contain exactly 10 digits."
    }
  },
  passwordHash: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doctor", doctorSchema);
