const Patient = require("../models/Patient");

async function createPatient(req, res, next) {
  try {
    const { name, gender, age, phone } = req.body;
    if (typeof name !== "string" || !name.trim() ||
        typeof gender !== "string" || !gender.trim() ||
        typeof phone !== "string") {
      return res.status(400).json({ message: "Name, gender, age, and phone are required." });
    }
    if (!Number.isInteger(Number(age)) || Number(age) < 1) {
      return res.status(400).json({ message: "Age must be a positive whole number." });
    }
    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({ message: "Phone must contain exactly 10 digits." });
    }

    const patient = await Patient.create({ name, gender, age: Number(age), phone: String(phone) });
    return res.status(201).json(patient);
  } catch (error) {
    return next(error);
  }
}

async function getPatients(req, res, next) {
  try {
    const search = req.query.search?.trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { phone: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") } }
          ]
        }
      : {};

    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    return res.json(patients);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createPatient, getPatients };
