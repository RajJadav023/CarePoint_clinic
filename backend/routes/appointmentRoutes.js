const express = require("express");
const {
  createAppointment,
  getAppointments,
  getPendingAppointments,
  getTodaysAppointments
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/", createAppointment);
router.get("/today", getTodaysAppointments);
router.get("/pending", getPendingAppointments);
router.get("/", getAppointments);

module.exports = router;
