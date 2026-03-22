const mangoose = require('mongoose');
const bcrypt = require('bcrypt')

const { Schema } = mangoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 4
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 18) {
                throw new Error('User should be older than 18')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
},
    {
        timestamps: true,
    })

userSchema.methods.validatePassword = async function (password) {
    const user = this;
    const passwordHashValue = user.password;
    const isPasswordValid = await bcrypt.compare(
        password,
        passwordHashValue
    );
    return isPasswordValid;
}

const User = mangoose.model('User', userSchema);

module.exports = User;