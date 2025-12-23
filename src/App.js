const express = require('express');

const app = express();

app.use("/", (req, res) => {
    res.send('Listening from 3000')
})
app.listen(3000, () => {

})