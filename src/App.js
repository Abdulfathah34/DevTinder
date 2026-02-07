const express = require('express');
const connectDB = require('./config.js/database');
const User = require('./models/user');

const app = express();

app.use(express.json());

app.use('/', (req, _, next) => {
    console.log('Reuest Received on =>', req.originalUrl)
    next();
})

app.post('/signup', async (req, res) => {
    const newUser = new User(req.body)
    try {
        await newUser.save();
        res.send('User added successfully');
    }
    catch (err) {
        res.status(400).send(`Something went wrong ${e}`)
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
        const user = await User.findOneAndUpdate(reqDetails, updateDate, { new: true })
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

