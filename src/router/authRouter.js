const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { validateSignUpData } = require('../Utils/validate');
const { userAuth } = require('../middleware/auth');


authRouter.post('/signup', async (req, res) => {
    try {
        const data = req.body
        const encryptedPassword = await bcrypt.hash(data.password, 10)
        validateSignUpData(data);
        const newUser = new User({ name: data.name, password: encryptedPassword, email: data.email, age: data?.age })
        await newUser.save();
        res.send('User added successfully');
    }
    catch (err) {
        res.status(400).send(`Something went wrong ${err}`)
    }
});

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDetails = await User.findOne({ email: username })
        if (userDetails) {
            const match = await userDetails.validatePassword(password);
            if (match) {
                const token = jwt.sign({ userId: userDetails._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie("token", token, { expires: new Date(Date.now() + 3600000) });
                res.send('Succesfully Logged In')
            } else {
                throw new Error('Invalid User Credentials')
            }
        } else {
            throw new Error('Invalid User')
        }
    } catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

authRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send('Logged out successfully');
})

authRouter.put('/changePassword', userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different" });
        }
        const user = req.userDetails;
        const isValid = await user.validatePassword(oldPassword);
        if (!isValid) {
            return res.status(401).json({ message: "Old password incorrect" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = authRouter;