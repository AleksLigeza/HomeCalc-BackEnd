var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');

var app = express();

var auth = require('./auth.js');
var operation = require('./operations.js');
var User = require('./models/User.js');

mongoose.Promise = Promise;

var posts = [
    { message: 'hello' },
    { message: 'hi' }
]

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://test:test@ds161306.mlab.com:61306/homecalc', (err) => {
    if (!err) {
        console.log('connected to mongo')
    }
});

app.use('/auth', auth.router);
app.use('/operations', operation.router);
app.listen(3000);