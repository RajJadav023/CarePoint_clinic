const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

function createToken(doctor) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");

  return jwt.sign({ sub: doctor._id.toString() }, secret, { expiresIn: "12h" });
}

function doctorResponse(doctor) {
  return {
    token: createToken(doctor),
    doctor: {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone
    }
  };
}

async function registerDoctor(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must contain exactly 10 digits." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const doctor = await Doctor.create({ name, email, phone, passwordHash });
    return res.status(201).json(doctorResponse(doctor));
  } catch (error) {
    return next(error);
  }
}

async function loginDoctor(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const doctor = await Doctor.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    if (!doctor || !(await bcrypt.compare(password, doctor.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    return res.json(doctorResponse(doctor));
  } catch (error) {
    return next(error);
  }
}

module.exports = { loginDoctor, registerDoctor };
