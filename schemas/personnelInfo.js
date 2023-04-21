var { Schema, model, models } = require('mongoose');

var reqString = {
	type: String,
	required: true,
};

var reqNum = {
	type: Number,
	required: true,
};

var personnelInfoSchema = new Schema({
	discordId: reqString,
	charName: reqString,
	carsSold: reqNum,
	commission25Percent: reqNum,
	commission30Percent: reqNum,
	weeklyCarsSold: reqNum,
	embedColor: reqString,
	embedMsgId: reqString,
	bankAccount: reqString,
});

module.exports = models['personnelInfo'] || model('personnelInfo', personnelInfoSchema);