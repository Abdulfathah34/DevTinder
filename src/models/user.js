const mangoose = require('mongoose');

const { Schema } = mangoose;

const userSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    age: {
        type: Number,
    },
    password: {
        type: String,
    },
})

const User = mangoose.model('User', userSchema);

module.exports = User;