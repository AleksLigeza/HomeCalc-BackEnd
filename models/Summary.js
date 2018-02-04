var mongoose = require('mongoose');

var summarySchema = new mongoose.Schema({
    amount: Number,
    bills: Number,
    income: Number,
    lastMonthBills: Number,
    lastMonthIncome: Number,
});

module.exports = mongoose.model('Summary', summarySchema);