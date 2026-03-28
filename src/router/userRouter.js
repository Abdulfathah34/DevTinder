const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

const userRouter = express.Router();

userRouter.get('/user/request/received', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.userDetails;
        const connectionRequestData = await ConnectionRequestModel.find({
            toUserId: loggedInUser?._id,
            status: 'intrested'
        }).populate("fromUserId", ["name", "age"])
        return res.status(200).json(connectionRequestData)
    } catch (e) {
        res.status(400).send("Something went wrong" + e);
    }
})

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.userDetails;
        const connectionRequestData = await ConnectionRequestModel.find({
            $or: [
                { toUserId: loggedInUser?._id, status: 'accepted' },
                { fromUserId: loggedInUser?._id, status: 'accepted' }
            ],
            status: 'accepted'
        }).populate("fromUserId", ["name", "age"])
            .populate("toUserId", ["name", "age"])
        const data = connectionRequestData.map(item => {
            const isSender = item.fromUserId._id.toString() === loggedInUser._id.toString();
            const otherUser = isSender ? item.toUserId : item.fromUserId;

            return {
                ...otherUser.toObject(),
                connectionId: item._id
            };
        });
        return res.status(200).json(data)
    } catch (e) {
        res.status(400).send("Something went wrong" + e);
    }
})

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const currentUser = req?.userDetails;

        const connectionRequests = await ConnectionRequestModel.find({
            $or: [{ fromUserId: currentUser?._id }, { toUserId: currentUser?._id }]
        }).select('fromUserId toUserId')

        const usersNeedtoBeHidden = new Set();
        connectionRequests.map(user => {
            usersNeedtoBeHidden.add(user?.fromUserId?.toString());
            usersNeedtoBeHidden.add(user?.toUserId?.toString());
        })

        const feedData = await User?.find({
            $and: [
                { _id: { $nin: Array.from(usersNeedtoBeHidden) } },
                { _id: { $ne: currentUser?._id } }
            ]

        }).select("name age")

        return res.json(feedData);
    } catch (e) {
        res.status(400).send("Something went wrong" + e);
    }

})


module.exports = userRouter;