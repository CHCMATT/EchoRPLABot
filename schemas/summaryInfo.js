var { Schema, model, models } = require('mongoose');

var reqString = {
	type: String,
	required: true,
};

var reqNum = {
	type: Number,
	required: true,
};

var summaryInfoSchema = new Schema({
	summaryName: reqString,
	value: reqNum,
	msgId: String
});

module.exports = models['summaryInfo'] || model('summaryInfo', summaryInfoSchema);