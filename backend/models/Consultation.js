const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
    unique: true
  },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: String, required: true },
  bloodPressure: { type: String, required: true, trim: true },
  temperature: { type: Number, required: true, min: 1 },
  notes: { type: String, required: true, trim: true },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Consultation", consultationSchema);
