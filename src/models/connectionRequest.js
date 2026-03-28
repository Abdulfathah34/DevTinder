const mangoose = require('mongoose');

const { Schema } = mangoose;

const connectionRequestSchema = new Schema({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['ignored', 'interested', 'accepted', 'rejected'],
        meessage: 'Incorrect status type',
    }
}, { timestamps: true })

connectionRequestSchema.pre('save', async function () {
    if (this.fromUserId.equals(this.toUserId)) {
        throw new Error('Cannot send connection request to yourself');
    }
});


const ConnectionRequestModel = mangoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequestModel;