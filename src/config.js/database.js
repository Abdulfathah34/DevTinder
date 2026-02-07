const mangoose = require('mongoose');

const connectDB = async () => {
    await mangoose.connect('mongodb+srv://fathaha982:ABbNry8kDSQVY32v@devplayground.gcwdhms.mongodb.net/devTinder');
}

module.exports = connectDB;