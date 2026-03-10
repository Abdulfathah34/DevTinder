const express = require('express');
const profileRouter = express.Router();
const User = require('../models/user');
const { userAuth } = require('../middleware/auth');
const { validateProfileEditData } = require('../Utils/validate');

profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const userDetails = req.userDetails;
        if (!userDetails) {
            return res.status(404).send("User not found");
        }
        return res.status(200).json(userDetails);
    } catch (e) {
        return res.status(401).send(
            `Invalid or expired token`
        );
    }
});


profileRouter.get('/getUser', userAuth, async (req, res) => {
    try {
        const reqDetails = req.body;
        const user = await User.find(reqDetails);
        res.send(user)
    }
    catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})


profileRouter.put('/updateUser', userAuth, async (req, res) => {
    try {
        const reqDetails = req.userDetails;
        validateProfileEditData(req.body.newData);
        const updateDate = req.body.newData;
        // const user = await User.findOneAndUpdate(reqDetails, { $set: updateDate }, { runValidators: true, })
        Object.assign(reqDetails, updateDate);
        await reqDetails.save();
        res.status(200).json(reqDetails);
    }
    catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

profileRouter.delete('/deletUser', async (req, res) => {
    const reqDetails = req.body;
    try {
        const user = await User.deleteOne(reqDetails)
        res.json({
            message: 'User Deleted',
            user: user
        });
    } catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

module.exports = profileRouter;