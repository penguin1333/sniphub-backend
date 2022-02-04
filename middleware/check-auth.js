const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // decode the token from the request header bearer and store it in the request object
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Authentication failed",
        });
    }
    /*try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Auth failed" });
    }*/
};