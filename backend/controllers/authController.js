const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const studentSignup = async (req, res) => {
    try {
        const {
            student_id,
            name,
            email,
            password,
            confirm_password
        } = req.body;

        // 1. Check required fields
        if (!student_id || !name || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Validate 12-digit student enrollment number
        if (!/^[0-9]{12}$/.test(student_id)) {
            return res.status(400).json({
                success: false,
                message: "Student Enrollment Number must contain exactly 12 digits"
            });
        }

        // 3. Check password confirmation
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // 4. Check whether email already exists
        const [existingEmail] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // 5. Check whether enrollment number already exists
        const [existingStudent] = await db.query(
            "SELECT id FROM users WHERE student_id = ?",
            [student_id]
        );

        if (existingStudent.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Student Enrollment Number is already registered"
            });
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Insert student
        await db.query(
            `INSERT INTO users 
            (name, email, password, role, student_id)
            VALUES (?, ?, ?, 'student', ?)`,
            [name, email, hashedPassword, student_id]
        );

        // 8. Send success response
        res.status(201).json({
            success: true,
            message: "Student account created successfully"
        });

    } catch (error) {
        console.error("Student Signup Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const facultySignup = async (req, res) => {
    try {
        const {
            faculty_id,
            name,
            email,
            password,
            confirm_password,
            registration_code
        } = req.body;

        // 1. Check required fields
        if (
            !faculty_id ||
            !name ||
            !email ||
            !password ||
            !confirm_password ||
            !registration_code
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Check faculty registration code
        if (registration_code !== process.env.FACULTY_REGISTRATION_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid faculty registration code"
            });
        }

        // 3. Check password confirmation
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // 4. Check duplicate email
        const [existingEmail] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // 5. Check duplicate faculty ID
        const [existingFaculty] = await db.query(
            "SELECT id FROM users WHERE faculty_id = ?",
            [faculty_id]
        );

        if (existingFaculty.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Faculty ID is already registered"
            });
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Insert faculty
        await db.query(
            `INSERT INTO users
            (name, email, password, role, faculty_id)
            VALUES (?, ?, ?, 'faculty', ?)`,
            [name, email, hashedPassword, faculty_id]
        );

        // 8. Success response
        res.status(201).json({
            success: true,
            message: "Faculty account created successfully"
        });

    } catch (error) {
        console.error("Faculty Signup Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user by email
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 3. Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 5. Send response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                student_id: user.student_id,
                faculty_id: user.faculty_id
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    studentSignup,
    facultySignup,
    login
};