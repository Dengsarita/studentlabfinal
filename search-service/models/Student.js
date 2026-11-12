const mongoose = require("mongoose");

// Same "students" collection the registration service writes to
const studentSchema = new mongoose.Schema(
    {
        student_id: Number,
        student_name: String,
        student_mobile: String,
        student_email: { type: String, lowercase: true, trim: true },
        student_password: String
    },
    { timestamps: true }
);

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema, "students");
