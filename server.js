const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Students = require("./models/userModel");
const Admin = require("./models/adminModel");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//search student
app.get("/student/:lrn", async (req, res) => {
  try {
    const { lrn } = req.params;
    const student = await Students.find({ lrn: lrn });

    if (student.length === 0) {
      return res.status(404).json({ message: "No matching records found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student
app.put("/student/:lrn", async (req, res) => {
  try {
    const { lrn } = req.params;
    const updatedStudent = await Students.findOneAndUpdate({ lrn }, req.body, {
      new: true,
    });

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: `Cannot find any student with LRN ${lrn}` });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//fetch all students
app.get("/student", async (req, res) => {
  try {
    const students = await Students.find({});
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//register student
app.post("/student", async (req, res) => {
  const { lrn } = req.body;
  const { rfid } = req.body;

  try {
    // Check if the rfid is registered
    const existingRfid = await Students.findOne({ rfid: rfid });

    if (!existingRfid) {
      try {
        // Check if the email is already taken
        const existingUser = await Students.findOne({ lrn });

        if (existingUser) {
          return res.status(400).json({ message: "lrn already taken." });
        }

        // If the email is not taken, create the user
        const user = await Students.create(req.body);
        res.status(200).json(user);
        console.log("User registered!");
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(500).json({ message: "rfid already taken" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// add admin
app.post("/admin", async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(200).json(admin);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//login
app.post("/login", async (req, res) => {
  const { username, lrn } = req.body;

  try {
    // Find the user by email
    const user = await Students.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    // Compare the provided password with the stored password
    if (user.lrn !== lrn) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Incorrect lrn." });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Set the token as a cookie
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

    // Respond with the token as a Bearer token
    res.status(200).json({
      message: "Authentication successful",
      token: `${token}`,
      userId: user._id,
      lrn: user.lrn,
      rfid:user.rfid,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by email
    const user = await Admin.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    // Compare the provided password with the stored password
    if (user.password !== password) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Incorrect password." });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Set the token as a cookie (optional)
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

    // Respond with the token as a Bearer token
    res.status(200).json({
      message: "Authentication successful",
      token: `${token}`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://cpsuthesis:kassel58002@cluster.vtaltws.mongodb.net/studentdatabase"
  )
  .then(() => {
    console.log("connected to MongoDB");
    app.listen(3000, () => {
      console.log(`Node API app is running on port 3000`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
