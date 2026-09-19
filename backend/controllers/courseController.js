const db = require("../config/db");

const getCourses = async (req, res) => {
    try {
        const { search } = req.query;

        let query = `
            SELECT
                id,
                course_code,
                course_name,
                description,
                instructor,
                credits,
                created_at
            FROM courses
        `;

        let values = [];

        // Search courses
        if (search) {
            query += `
                WHERE course_code LIKE ?
                OR course_name LIKE ?
                OR instructor LIKE ?
            `;

            const searchValue = `%${search}%`;

            values = [
                searchValue,
                searchValue,
                searchValue
            ];
        }

        query += " ORDER BY id DESC";

        const [courses] = await db.query(query, values);

        res.status(200).json({
            success: true,
            count: courses.length,
            courses: courses
        });

    } catch (error) {
        console.error("Get Courses Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const addCourse = async (req, res) => {
    try {
        const {
            course_code,
            course_name,
            description,
            instructor,
            credits
        } = req.body;

        // Check required fields
        if (!course_code || !course_name || !instructor || !credits) {
            return res.status(400).json({
                success: false,
                message: "Course code, course name, instructor and credits are required"
            });
        }

        // Check duplicate course code
        const [existingCourse] = await db.query(
            "SELECT id FROM courses WHERE course_code = ?",
            [course_code]
        );

        if (existingCourse.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Course code already exists"
            });
        }

        // Insert course
        const [result] = await db.query(
            `INSERT INTO courses
            (course_code, course_name, description, instructor, credits)
            VALUES (?, ?, ?, ?, ?)`,
            [
                course_code,
                course_name,
                description || null,
                instructor,
                credits
            ]
        );

        res.status(201).json({
            success: true,
            message: "Course added successfully",
            course_id: result.insertId
        });

    } catch (error) {
        console.error("Add Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            course_code,
            course_name,
            description,
            instructor,
            credits
        } = req.body;

        // Check required fields
        if (!course_code || !course_name || !instructor || !credits) {
            return res.status(400).json({
                success: false,
                message: "Course code, course name, instructor and credits are required"
            });
        }

        // Check whether course exists
        const [existingCourse] = await db.query(
            "SELECT id FROM courses WHERE id = ?",
            [id]
        );

        if (existingCourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check duplicate course code
        const [duplicateCode] = await db.query(
            "SELECT id FROM courses WHERE course_code = ? AND id != ?",
            [course_code, id]
        );

        if (duplicateCode.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Course code already exists"
            });
        }

        // Update course
        await db.query(
            `UPDATE courses
             SET course_code = ?,
                 course_name = ?,
                 description = ?,
                 instructor = ?,
                 credits = ?
             WHERE id = ?`,
            [
                course_code,
                course_name,
                description || null,
                instructor,
                credits,
                id
            ]
        );

        res.status(200).json({
            success: true,
            message: "Course updated successfully"
        });

    } catch (error) {
        console.error("Update Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether course exists
        const [existingCourse] = await db.query(
            "SELECT id FROM courses WHERE id = ?",
            [id]
        );

        if (existingCourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Delete course
        await db.query(
            "DELETE FROM courses WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.error("Delete Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse
};