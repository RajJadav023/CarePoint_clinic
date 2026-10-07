const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

async function requireDoctor(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please log in to continue." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(payload.sub).select("_id name email phone");
    if (!doctor) return res.status(401).json({ message: "Doctor account was not found. Please log in again." });
    req.doctor = doctor;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session has expired. Please log in again." });
    }
    return next(error);
  }
}

module.exports = requireDoctor;
