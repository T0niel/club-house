require('dotenv').config();
const express = require('express');
const indexRouter = require('./routes/index');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);

const PORT = process.env.PORT || 3000; 

app.listen(PORT, (req, res) => {
    console.log(`Server live in port: ${PORT}`);
});