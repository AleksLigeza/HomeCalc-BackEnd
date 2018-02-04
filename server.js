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

app.get('/users', auth.checkAuthenticated, async (req, res) => {
    try {
        console.log(req.userId);
        var users = await User.find({}, '-password -__v');
        res.send(users);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/profile/:id', async (req, res) => {
    try {
        var user = await User.findById(req.params.id, '-password -__v');
        res.send(user);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/posts', (req, res) => {
    res.send(posts);
});

mongoose.connect('mongodb://test:test@ds161306.mlab.com:61306/homecalc', (err) => {
    if (!err) {
        console.log('connected to mongo')
    }
});

app.use('/auth', auth.router);
app.use('/operations', operation.router);
app.listen(3000);