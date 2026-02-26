const validator = require('validator');

const validateSignUpData = (userData) => {
    const { name, email, password } = userData;

    if (!validator.isEmail(email))
        throw new Error('Invalid Email')
    else if (name.length < 4) {
        throw new Error('Minimum length for name is 4')
    }
    // else if (!validator.isStrongPassword(password)) {
    //     throw new Error("Your password isn't strong")
    // }
}

module.exports = { validateSignUpData };