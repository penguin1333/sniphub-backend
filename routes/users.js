const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/users");

router.post("/signup", async (req, res) => {
    // check if user already exists
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: err,
            });
        }
        // if the user already exists, return an error message
        if (user) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        // if the user does not exist, create a new user
        const newUser = new User({
            username: req.body.username,
            password: req.body.password,
        });
        // hash the password
        bcrypt.hash(newUser.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            // set the password to the hashed password
            newUser.password = hash;
            // save the user
            newUser.save((err, user) => {
                if (err) {
                    return res.status(500).json({
                        error: err,
                    });
                }
                return res.status(201).json({
                    message: "User created",
                    user: user,
                });
            });
        });
    });
});

router.post("/login", (req, res) => {
    // find the user with the username from the request body and compare the password from the request body with the password from the database
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: err,
            });
        }
        // if the user is not found, return an error message
        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }
        // compare the password from the request body with the password from the database
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    error: err,
                });
            }
            // if the password from the request body is not the same as the password from the database, return an error message
            if (!result) {
                return res.status(401).json({
                    message: "Incorrect password",
                });
            }
            // if the password from the request body is the same as the password from the database, return a success message

            // create a token
            const token = jwt.sign(
                {
                    username: user.username,
                    userId: user._id,
                },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
            );

            return res.status(200).json({
                message: "Authentication successful",
                token: token,
            });
        });
    });
});

module.exports = router;
