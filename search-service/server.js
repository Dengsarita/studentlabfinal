require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();
app.use(morgan("dev"));
app.use(express.json());

// GET /search/student?id=1        -> search by student id
// GET /search/student?name=sarita -> search by name (partial, not case-sensitive)
app.get("/search/student", async (req, res) => {
    try {
        const { id, name } = req.query;

        if (!id && !name) {
            return res.status(400).json({ message: "Provide ?id=<student_id> or ?name=<student_name>" });
        }

        let filter;
        if (id) {
            if (isNaN(Number(id))) {
                return res.status(400).json({ message: "id must be a number" });
            }
            filter = { student_id: Number(id) };
        } else {
            // escape special characters so the name is searched as plain text
            const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter = { student_name: { $regex: safeName, $options: "i" } };
        }

        // never return the password hash
        const students = await Student.find(filter).select("-student_password -__v");

        if (students.length === 0) {
            return res.status(404).json({ message: "No student found" });
        }

        res.status(200).json({ count: students.length, students });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 7002;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("[search-service] You successfully connected to MongoDB!");
        app.listen(PORT, () => console.log(`Search Service listening on port ${PORT}`));
    })
    .catch((err) => {
        console.error("[search-service] MongoDB connection error:", err.message);
        process.exit(1);
    });
