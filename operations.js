var jwt = require('jwt-simple');
var express = require('express');
var router = express.Router();

var User = require('./models/User.js');
var Operation = require('./models/Operation.js')
var auth = require('./auth.js')

//cycleId === '-1' normalna operajca
//cycleId === '0' operacja zdefiniowana
//cycleId !== '-1' && cycleId !== '-1' operacja podlegajaca pod zdefniowana

router.get('/history/:skip', auth.checkAuthenticated, async (req, res) => {
    var user = req.userId;
    var skip = parseInt(req.params.skip);
    var history = await Operation.find({ userId: user, cycleId: { $ne: '0' } })
        .skip(skip)
        .limit(10)
        .sort({ date: -1 , createDate: -1 });

    res.status(200).send(history);

})

router.get('/details/:id', auth.checkAuthenticated, async (req, res) => {
    var id = req.params.id;
    await Operation.findOne({ _id: id, userId: req.userId }, (err, result) => {
        if (err) {
            return res.status(404).send(err);
        } else {
            return res.status(200).send(result);
        }
    });
})

router.delete('/delete/:id', auth.checkAuthenticated, async (req, res) => {
    var id = req.params.id;

    await Operation.findOneAndRemove({ _id: id, userId: req.userId }, function (err) {
        if (!err) {
            return res.status(200).send({ 'message': 'OK' });
        } else {
            return res.status(500).send(err);
        }
    });
})

router.post('/create', auth.checkAuthenticated, (req, res) => {

    var operationData = req.body;
    operationData.userId = req.userId;

    var newOpeartion = new Operation(operationData);
    newOpeartion.date.setHours(0,0,0,0);
    newOpeartion.createDate = Date();

    newOpeartion.save((err, result) => {
        if (err) {
            console.error('Saving error')
            return res.status(500).send({ message: 'Saving error' })
        }
        res.status(200).send({ 'Id': operationData._id });
    });
})

router.put('/update', auth.checkAuthenticated, async (req, res) => {

    var operationData = req.body;
    operationData.userId = req.userId;

    var newOpeartion = new Operation(operationData);
    newOpeartion.date.setHours(0,0,0,0);

    var oldOperation = await Operation.findOne({ _id: operationData.id, userId: req.userId }, (err, result) => {
        if (err) {
            return res.status(404).send(err);
        }
    });

    oldOperation.userId = newOpeartion.userId || oldOperation.userId;
    oldOperation.date = newOpeartion.date || oldOperation.date;
    oldOperation.income = newOpeartion.income;
    oldOperation.amount = newOpeartion.amount;
    oldOperation.description = newOpeartion.description;
    oldOperation.cycleId = newOpeartion.cycleId || oldOperation.cycleId;

    oldOperation.save((err, saveResult) => {
        if (err) {
            console.error('Saving error');
            return res.status(500).send(err);
        }
        res.status(200).send({ 'Id': 'operationData._id' });
    });
});

router.get('/cycles/:skip', auth.checkAuthenticated, async (req, res) => {
    var user = req.userId;
    var skip = parseInt(req.params.skip);
    var history = await Operation.find({ userId: user, cycleId: '0' })
        .skip(skip)
        .limit(10)
        .sort({ date: 1, createDate: -1 });

    res.status(200).send(history);
})

router.get('/cycle/:id', auth.checkAuthenticated, async (req, res) => {
    var user = req.userId;
    var id = req.params.id;
    var history = await Operation.find({ userId: user, cycleId: id })
        .sort({ date: -1 });

    res.status(200).send(history);
})

router.get('/summary', auth.checkAuthenticated, async (req, res) => {
    var user = req.userId;

    var bills = 0;
    var income = 0;
    var lastMonthBills = 0;
    var lastMonthIncome = 0;

    var history = await Operation.find({ userId: user, cycleId: { $ne: '0' } });

    var currentMonthHistory = history.filter(function (element) {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        if (element.date >= firstDay && element.date <= lastDay) {
            return element;
        }
    });

    var bills = currentMonthHistory.filter(function (element) {
        if (!element.income) {
            return element;
        }
    });

    var income = currentMonthHistory.filter(function (element) {
        if (element.income) {
            return element;
        }
    });

    var lastMonthHistory = history.filter(function (element) {
        var date = new Date();
        date.setDate(0);
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        if (element.date >= firstDay && element.date <= lastDay) {
            return element;
        }
    });

    var lastMonthBills = lastMonthHistory.filter(function (element) {
        if (!element.income) {
            return element;
        }
    });

    var lastMonthIncome = lastMonthHistory.filter(function (element) {
        if (element.income) {
            return element;
        }
    });

    var response = {
        amount: calculateAmount(history, true),
        bills: calculateAmount(bills, false),
        income: calculateAmount(income, false),
        lastMonthBills: calculateAmount(lastMonthBills, false),
        lastMonthIncome: calculateAmount(lastMonthIncome, false),
    }

    res.status(200).send(response);
})

function calculateAmount(array, checkIncome) {
    var amount = 0;
    array.forEach(element => {
        if (!checkIncome) {
            amount += element.amount;
        } else {
            if (element.income) {
                amount += element.amount;
            } else {
                amount -= element.amount;
            }
        }
    });
    return amount;
}

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
})

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
})


var operations = {
    router,
}

module.exports = operations;

