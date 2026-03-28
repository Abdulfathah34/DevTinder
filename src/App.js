const express = require('express');
const connectDB = require('./config.js/database');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRouter = require('./router/authRouter');
const profileRoutee = require('./router/profileRouter');
const requestRouter = require('./router/requestRouter');
const userRouter = require('./router/userRouter');

dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use('/', (req, _, next) => {
    console.log('Request Received on =>', req.originalUrl)
    next();
})

app.use('/', authRouter);
app.use('/', profileRoutee);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB().then(() => {
    console.log('Database connected successfully✅');
    app.listen(3000, () => {
        console.log('Server is running on port 3000✅')
    })
}).catch(err => {
    console.error('Database connection failed', err);
});

