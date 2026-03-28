const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const { status, toUserId } = req.params;
        const fromUserId = req.userDetails._id;
        const allowedStatus = ['ignored', 'interested'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const isToUserExists = await User.findById(toUserId);
        if (!isToUserExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isConnectionRequestExists = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });
        if (isConnectionRequestExists) {
            return res.status(400).json({ message: 'Connection request already exists' });
        }



        const connectionRequest = new ConnectionRequestModel({
            fromUserId,
            toUserId,
            status
        });


        await connectionRequest.save();
        res.send('Connection request sent successfully');

    } catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const currentUser = req.userDetails;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(404).json({
                message: "Invalid status type"
            })
        }
        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            toUserId: currentUser?._id,
            status: 'interested'
        })
        if (!connectionRequest) {
            return res.status(404).json({
                message: "No request found"
            })
        }
        connectionRequest.status = status;
        const data = await connectionRequest?.save();
        return res.status(200).json({
            message: "Successfully Reviewed"
        })
    } catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

module.exports = requestRouter;