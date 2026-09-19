const db = require("../config/db");

const enrollCourse = async (req, res) => {
    try {
        const { course_id } = req.body;

        // Check course ID
        if (!course_id) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        // Check whether course exists
        const [courses] = await db.query(
            "SELECT id FROM courses WHERE id = ?",
            [course_id]
        );

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check duplicate enrollment
        const [existingEnrollment] = await db.query(
            `SELECT id
             FROM enrollments
             WHERE student_id = ? AND course_id = ?`,
            [req.user.id, course_id]
        );

        if (existingEnrollment.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course"
            });
        }

        // Create enrollment
        const [result] = await db.query(
            `INSERT INTO enrollments
             (student_id, course_id, enrollment_date)
             VALUES (?, ?, CURDATE())`,
            [req.user.id, course_id]
        );

        res.status(201).json({
            success: true,
            message: "Course enrollment successful",
            enrollment_id: result.insertId
        });

    } catch (error) {
        console.error("Enroll Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getMyEnrollments = async (req, res) => {
    try {
        const [enrollments] = await db.query(
            `SELECT
                e.id AS enrollment_id,
                c.id AS course_id,
                c.course_code,
                c.course_name,
                c.description,
                c.instructor,
                c.credits,
                e.enrollment_date
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.student_id = ?
             ORDER BY e.enrollment_date DESC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments: enrollments
        });

    } catch (error) {
        console.error("Get My Enrollments Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getAllEnrollments = async (req, res) => {
    try {
        const [enrollments] = await db.query(
            `SELECT
                e.id AS enrollment_id,
                u.name AS student_name,
                u.student_id AS student_enrollment_number,
                u.email AS student_email,
                c.course_code,
                c.course_name,
                c.instructor,
                c.credits,
                e.enrollment_date
             FROM enrollments e
             JOIN users u ON e.student_id = u.id
             JOIN courses c ON e.course_id = c.id
             ORDER BY e.enrollment_date DESC`
        );

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments: enrollments
        });

    } catch (error) {
        console.error("Get All Enrollments Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    enrollCourse,
    getMyEnrollments,
    getAllEnrollments
};