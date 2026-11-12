require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();
app.use(morgan("dev"));
app.use(express.json());

// POST /register/student
app.post("/register/student", async (req, res) => {
    try {
        const { student_name, student_mobile, student_email, student_password } = req.body;

        if (!student_name || !student_mobile || !student_email || !student_password) {
            return res.status(400).json({ message: "student_name, student_mobile, student_email and student_password are required" });
        }
        if (!/^\S+@\S+\.\S+$/.test(student_email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        if (student_password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const exists = await Student.findOne({ student_email: student_email.toLowerCase() });
        if (exists) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const student = await Student.create({
            student_name,
            student_mobile,
            student_email,
            student_password: await bcrypt.hash(student_password, 10)
        });

        res.status(201).json({ message: "Student registered successfully", student });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 7001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("[registration-service] You successfully connected to MongoDB!");
        app.listen(PORT, () => console.log(`Registration Service listening on port ${PORT}`));
    })
    .catch((err) => {
        console.error("[registration-service] MongoDB connection error:", err.message);
        process.exit(1);
    });
