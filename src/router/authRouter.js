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
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try {
        const userDetails = req.userDetails;
        const isOldPasswordValid = await userDetails.validatePassword(oldPassword);
        if (!isOldPasswordValid) {
            throw new Error('Old password is incorrect');
        }
        if (newPassword !== confirmNewPassword) {
            throw new Error('New password and confirm password do not match');
        }
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        userDetails.password = encryptedPassword;
        await userDetails.save();
        res.send('Password changed successfully');
    } catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

module.exports = authRouter;