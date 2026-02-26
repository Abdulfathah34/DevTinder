const express = require('express');
const connectDB = require('./config.js/database');
const User = require('./models/user');
const { validateSignUpData } = require('./Utils/validate');
const app = express();
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { userAuth } = require('./middleware/auth');

dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use('/', (req, _, next) => {
    console.log('Request Received on =>', req.originalUrl)
    next();
})

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
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

app.get('/profile', userAuth, async (req, res) => {
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

app.get('/getUser', async (req, res) => {
    try {
        const reqDetails = req.body;
        const user = await User.find(reqDetails);
        res.send(user)
    }
    catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

app.put('/updateUser', async (req, res) => {
    try {
        const reqDetails = req.body.filter;
        const updateDate = req.body.newData;
        console.log(req.body);
        const user = await User.findOneAndUpdate(reqDetails, { $set: updateDate }, { runValidators: true })
        res.status(200).json(user);
    }
    catch (e) {
        res.status(400).send(`Something went wrong ${e}`)
    }
})

app.delete('/deletUser', async (req, res) => {
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

connectDB().then(() => {
    console.log('Database connected successfully✅');
    app.listen(3000, () => {
        console.log('Server is running on port 3000✅')
    })
}).catch(err => {
    console.error('Database connection failed', err);
});

