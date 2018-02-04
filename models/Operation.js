var mongoose = require('mongoose');

var operationSchema = new mongoose.Schema({
    date: Date,
    userId: String,
    income: Boolean,
    amount: Number,
    description: String,
    cycleId: String,
});

module.exports = mongoose.model('Operation', operationSchema);