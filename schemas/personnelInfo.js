let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let personnelInfoSchema = new Schema({
	discordId: reqString,
	charName: reqString,
	carsSold: reqNum,
	commission25Percent: reqNum,
	commission30Percent: reqNum,
	embedColor: reqString,
	embedMsgId: reqString,
	bankAccount: reqString,
	weeklyCarsSold: reqNum,
});

module.exports = models['personnelInfo'] || model('personnelInfo', personnelInfoSchema);