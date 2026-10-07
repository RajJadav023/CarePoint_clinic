const express = require("express");
const {
  createConsultation,
  getConsultationPatients,
  getPatientConsultations
} = require("../controllers/consultationController");

const router = express.Router();

router.post("/", createConsultation);
router.get("/patients", getConsultationPatients);
router.get("/patient/:patientId", getPatientConsultations);

module.exports = router;
