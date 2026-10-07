const express = require("express");
const { loginDoctor, registerDoctor } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);

module.exports = router;
