const express = require("express");

const {
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// View courses - Student + Faculty
router.get(
    "/",
    authMiddleware,
    getCourses
);

// Add course - Faculty only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty"),
    addCourse
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty"),
    updateCourse
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty"),
    deleteCourse
);

module.exports = router;