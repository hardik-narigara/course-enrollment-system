const express = require("express");

const {
    studentSignup,
    facultySignup,
    login
} = require("../controllers/authController");

const router = express.Router();

// Student Signup
router.post("/signup/student", studentSignup);

// Faculty Signup
router.post("/signup/faculty", facultySignup);

// Login
router.post("/login", login);

module.exports = router;