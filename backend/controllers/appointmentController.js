const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultation");
const Patient = require("../models/Patient");

const doctors = ["Dr. Rahul Shah", "Dr. Priya Patel", "Dr. Amit Mehta"];

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function createAppointment(req, res, next) {
  try {
    const { patient, doctor, date, time } = req.body;
    if (!patient || !doctor || !date || !time) {
      return res.status(400).json({ message: "Patient, doctor, date, and time are required." });
    }
    if (!doctors.includes(doctor)) {
      return res.status(400).json({ message: "Select a doctor from the available list." });
    }
    const parsedDate = new Date(`${date}T00:00:00`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(parsedDate.getTime()) &&
      localDateString(parsedDate) === date;
    const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
    if (!validDate || !validTime) {
      return res.status(400).json({ message: "Enter a valid appointment date and time." });
    }
    const existingPatient = await Patient.exists({ _id: patient });
    if (!existingPatient) {
      return res.status(404).json({ message: "Selected patient was not found." });
    }

    const appointment = await Appointment.create({ patient, doctor, date, time });
    await appointment.populate("patient", "name gender age phone");
    return res.status(201).json(appointment);
  } catch (error) {
    return next(error);
  }
}

async function getAppointments(req, res, next) {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name gender age phone")
      .sort({ date: 1, time: 1, createdAt: -1 });
    return res.json(appointments);
  } catch (error) {
    return next(error);
  }
}

async function getPendingAppointments(req, res, next) {
  try {
    const completedAppointmentIds = await Consultation.distinct("appointment");
    const appointments = await Appointment.find({
      status: "Scheduled",
      _id: { $nin: completedAppointmentIds }
    })
      .populate("patient", "name gender age phone")
      .sort({ date: 1, time: 1, createdAt: -1 });
    return res.json(appointments);
  } catch (error) {
    return next(error);
  }
}

async function getTodaysAppointments(req, res, next) {
  try {
    const appointments = await Appointment.find({ date: localDateString() })
      .populate("patient", "name gender age phone")
      .sort({ time: 1 });
    return res.json(appointments);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  getPendingAppointments,
  getTodaysAppointments
};
