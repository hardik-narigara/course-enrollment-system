const express = require("express");

const {
    enrollCourse,
    getMyEnrollments,
    getAllEnrollments
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Student enrollment
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    enrollCourse
);

// Student's own enrollments
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyEnrollments
);

// Faculty - view all enrollments
router.get(
    "/",
    authMiddleware,
    roleMiddleware("faculty"),
    getAllEnrollments
);

module.exports = router;