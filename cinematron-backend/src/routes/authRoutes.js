const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login (público)
router.post("/login", authController.login);

module.exports = router;
