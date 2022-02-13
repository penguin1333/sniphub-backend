const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // decode the token from the request header bearer and store it in the request object
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Authentication failed",
        });
    }
};
