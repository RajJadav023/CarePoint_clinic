require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const requireDoctor = require("./middleware/requireDoctor");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/patients", requireDoctor, require("./routes/patientRoutes"));
app.use("/api/appointments", requireDoctor, require("./routes/appointmentRoutes"));
app.use("/api/consultations", requireDoctor, require("./routes/consultationRoutes"));

app.use((req, res) => res.status(404).json({ message: "API route not found." }));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with this information already exists." });
  }
  return res.status(500).json({ message: "Something went wrong. Please try again." });
});

const port = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  console.error("Unable to start API: JWT_SECRET is not configured.");
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`Clinic API listening on port ${port}`));
  })
  .catch((error) => {
    console.error(`Unable to start API: ${error.message}`);
    process.exit(1);
  });
