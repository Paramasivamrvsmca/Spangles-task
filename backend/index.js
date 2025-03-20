const express = require("express");
const cors = require("cors"); // Import cors
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Enable CORS for all origins (you can limit this to specific origins)
app.use(cors());

app.use(bodyParser.json()); // for parsing application/json

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/sivam_spangles", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));

// User model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Register Route
app.post("/api/register", async (req, res) => {
    const { username, email, phone, password } = req.body;

    // Log the incoming request data
    console.log("Incoming registration data:", req.body);

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        console.log("Creating a new user...");
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword,
        });

        console.log("Saving new user...");
        // Save user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: newUser._id }, "123456789", {
            expiresIn: "1h",
        });

        console.log("Registration successful");
        res.status(201).json({ message: "Registration successful", token });
    } catch (error) {
        console.error("Error during registration:", error);  // Log the error in detail
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Generate a JWT token for the user
        const token = jwt.sign({ userId: user._id }, "your_secret_key", { expiresIn: "1h" });

        // Respond with user information and token
        res.status(200).json({
            message: "Login successful",
            token: token,
            name: user.username, // You can return more user info if necessary
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
