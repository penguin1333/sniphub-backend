// .env
const dotenv = require("dotenv");
dotenv.config();

// modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

// create express app
const app = express();

// data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
    })
);
app.use(morgan("dev"));

// routes
app.use("/api/snippets", require("./routes/snippets"));
app.use("/api/users", require("./routes/users"));

// error handling
app.use((req, res, next) => {
    const error = new Error("API Request URL not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

// db and server start
mongoose
    .connect(process.env.DB_HOST)
    .then(() => {
        console.log("Connected to database");
        app.listen(process.env.PORT || 5000);
        console.log("Server connected on port " + process.env.PORT);
    })
    .catch(() => {
        console.log("Couldn't connect to database");
    });
