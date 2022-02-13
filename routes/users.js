const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/users");

const router = express.Router();

// JWT token generation
const generateToken = (username, id) => {
    const token = jwt.sign(
        { username: username, userId: id },
        process.env.JWT_SECRET
    );
    return token;
};

/*
    Signup API
*/
router.post("/signup", async (req, res) => {
    // Create variable for the user data
    const { username, password } = req.body;

    // Check if fields are empty
    if (!username || !password) {
        return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if user exists
    try {
        const user = await User.findOne({ username: username });
        if (user) {
            return res.status(409).json({
                message: "User already exists",
            });
        }
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Error checking if user exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
        username: username,
        password: hashedPassword,
    });

    // Save user to database
    const savedUser = await newUser.save();
    if (savedUser) {
        return res.status(201).json({ message: "User created successfully" });
    } else {
        return res.status(500).json({ message: "Error saving user" });
    }
});

/*
    Login API
*/
router.post("/login", async (req, res) => {
    // Variables for the user data
    const { username, password } = req.body;

    // Check if fields are empty
    if (!username || !password) {
        return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if user exists
    const user = await User.findOne({ username: username });
    if (!user) {
        return res.status(401).json({
            message: "User does not exist",
        });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid credentials",
        });
    }

    // Create and assign token
    const token = generateToken(user.username, user._id);

    // Return user and token
    return res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
            username: user.username,
            userId: user._id,
        },
    });
});

module.exports = router;
