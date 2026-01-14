const express = require('express');

const app = express();

const userAuthentication = (req, res, next) => {        //user authentication middleware
    const isAuthenticated = true
    if (isAuthenticated) {
        next()
    }
    else {
        res.status(401).send('Not Authenticated')
    }
}

app.use('/', (req, res, next) => {          //normal route
    console.log('Home Endpoint Reached')
    res.send('Home Page')
})


app.use('/user', userAuthentication, (req, res) => {    //protected route with middleware
    console.log('User Endpoint Reached')
    res.send('User Reached')
})


app.use('/', (err, req, res, next) => {     //Error handling route
    console.log('Home Endpoint Reached')
    if (err) {
        res.status(500).send('Internal Server Error')
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})