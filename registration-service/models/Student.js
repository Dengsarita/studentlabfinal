const mongoose = require("mongoose");

// Counter collection -> gives each student an auto-increment Student_id
const Counter = mongoose.models.Counter || mongoose.model(
    "Counter",
    new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } })
);

const studentSchema = new mongoose.Schema(
    {
        student_id: { type: Number, unique: true },
        student_name: { type: String, required: true, trim: true },
        student_mobile: { type: String, required: true, trim: true },
        student_email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        student_password: { type: String, required: true }   // bcrypt hash
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                delete ret.student_password;   // never send the password back
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Assign the next Student_id before saving a new student
studentSchema.pre("validate", async function () {
    if (this.isNew && !this.student_id) {
        const counter = await Counter.findByIdAndUpdate(
            "student_id",
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.student_id = counter.seq;
    }
});

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema, "students");
