const jwt = require('jsonwebtoken');
const User = require('./../models/user');

const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Unauthorized Access");
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        const userDetails = await User.findById(decoded.userId);
        if (!userDetails) {
            return res.status(404).send("User not found");
        }
        req.userDetails = userDetails;
        next();
    }
    catch (e) {
        console.log("AUTH ERROR:", e.message);
        return res.status(401).send(e.message);
    }
};

module.exports = { userAuth };