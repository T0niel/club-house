require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello');
})

const PORT = process.env.PORT || 3000; 

app.listen(PORT, (req, res) => {
    console.log(`Server live in port: ${PORT}`);
});