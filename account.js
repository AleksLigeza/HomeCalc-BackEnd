var jwt = require('jwt-simple');
var express = require('express');
var router = express.Router();

var User = require('./models/User.js');
var Operation = require('./models/Operation.js')
var auth = require('./auth.js')

router.post('/changeEmail', auth.checkAuthenticated, async (req, res) => {
    var email = req.body.email;
    var user = await User.findById(req.userId, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
    });

    user.email = email;
    user.save((err, saveResult) => {
        if (err) {
            console.error('Saving error');
            return res.status(500).send(err);
        }
    });
    return res.status(200).send({ message: 'OK' });
});

router.post('/changePassword', auth.checkAuthenticated, async (req, res) => {
    var password = req.body.password;
    var user = await User.findById(req.userId, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
    });

    user.password = password;
    user.save((err, saveResult) => {
        if (err) {
            console.error('Saving error');
            return res.status(500).send(err);
        }
        res.status(200).send({ message: 'OK' });
    });
});

var account = {
    router,
}

module.exports = account;

