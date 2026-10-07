const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultation");
const Patient = require("../models/Patient");

async function createConsultation(req, res, next) {
  try {
    const { appointment: appointmentId, bloodPressure, temperature, notes } = req.body;
    if (!appointmentId || typeof bloodPressure !== "string" || !bloodPressure.trim() ||
        temperature === "" || temperature == null ||
        typeof notes !== "string" || !notes.trim()) {
      return res.status(400).json({ message: "Appointment, blood pressure, temperature, and notes are required." });
    }
    const numericTemperature = Number(temperature);
    if (!Number.isFinite(numericTemperature) || numericTemperature <= 0) {
      return res.status(400).json({ message: "Temperature must be a positive number." });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment was not found." });
    }
    if (appointment.status === "Completed") {
      return res.status(409).json({ message: "This appointment has already been completed." });
    }

    const consultation = await Consultation.create({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      bloodPressure,
      temperature: numericTemperature,
      notes
    });
    appointment.status = "Completed";
    await appointment.save();
    await consultation.populate([
      { path: "patient", select: "name gender age phone" },
      { path: "appointment", select: "date time status" }
    ]);
    return res.status(201).json(consultation);
  } catch (error) {
    return next(error);
  }
}

async function getPatientConsultations(req, res, next) {
  try {
    const consultations = await Consultation.find({ patient: req.params.patientId })
      .populate("patient", "name gender age phone")
      .populate("appointment", "date time status")
      .sort({ completedAt: -1 });
    return res.json(consultations);
  } catch (error) {
    return next(error);
  }
}

async function getConsultationPatients(req, res, next) {
  try {
    const patientIds = await Consultation.distinct("patient");
    const patients = await Patient.find({ _id: { $in: patientIds } })
      .select("name gender age phone")
      .sort({ name: 1 });
    return res.json(patients);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createConsultation,
  getConsultationPatients,
  getPatientConsultations
};
