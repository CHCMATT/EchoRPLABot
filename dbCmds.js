var summaryInfo = require('./schemas/summaryInfo');
var personnelInfo = require('./schemas/personnelInfo');

module.exports.readSummValue = async (summaryName) => {
	var result = await summaryInfo.findOne({ summaryName }, { value: 1, _id: 0 });
	if (result !== null) {
		return result.value;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};

module.exports.addOneSumm = async (summaryName) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: 1 } }, { upsert: true });
};

module.exports.subtractOneSumm = async (summaryName) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: -1 } }, { upsert: true });
};

module.exports.setSummValue = async (summaryName, newValue) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: newValue }, { upsert: true });
};

module.exports.resetSummValue = async (summaryName) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: 0 }, { upsert: true });
};


// for finding and adding to the personnel's statistics
module.exports.initPersStats = async (discordId, discordNickname, embedColor, embedMsgId) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { discordId: discordId, charName: discordNickname, embedColor: embedColor, embedMsgId: embedMsgId, carsSold: 0, commission25Percent: 0, commission30Percent: 0 }, { upsert: true });
};

module.exports.readPersStats = async (discordId) => {
	var result = await personnelInfo.findOne({ discordId: discordId }, { discordId: 1, charName: 1, embedMsgId: 1, embedColor: 1, carsSold: 1, commission25Percent: 1, commission30Percent: 1, bankAccount: 1, _id: 0 });
	return result;
};

module.exports.setPersColor = async (discordId, embedColor) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { embedColor: embedColor }, { upsert: true });
};

module.exports.addOnePersStat = async (discordId, statName) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: 1 } });
};

module.exports.subtractOnePersStat = async (discordId, statName) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: -1 } });
};

module.exports.setBankAccount = async (discordId, bankNum) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { bankAccount: bankNum }, { upsert: true });
};


//personnel message id stuff
module.exports.setPersonnelMsgId = async (discordId, embedId) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { embedMsgId: embedId }, { upsert: true });
};

module.exports.readPersonnelMsgId = async (discordId) => {
	var result = await personnelInfo.findOne({ discordId: discordId }, { embedMsgId: 1, _id: 0 });
	return result.embedMsgId;
};


// commission stuff
module.exports.addCommission = async (discordId, commission25Percent, commission30Percent) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { commission25Percent: commission25Percent, commission30Percent: commission30Percent } }, { upsert: true });
};

module.exports.resetCommission = async (discordId) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { commission25Percent: 0, commission30Percent: 0 });
};

module.exports.readCommission = async (discordId) => {
	var result = await personnelInfo.findOne({ discordId: discordId }, { commission25Percent: 1, commission30Percent: 1, _id: 0 });
	return result;
};

module.exports.weeklyCommissionRep = async () => {
	var result = await personnelInfo.find({ commission25Percent: { $gt: 1 } }, { discordId: 1, charName: 1, commission25Percent: 1, commission30Percent: 1, bankAccount: 1, _id: 0 });
	return result;
};


// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	var result = await summaryInfo.findOne({ summaryName }, { msgId: 1, _id: 0 });
	if (result !== null) {
		return result.msgId;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};


// for setting string of latest commission report date
module.exports.setRepDate = async (summaryName, newValue) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { repDate: newValue }, { upsert: true });
};

module.exports.readRepDate = async (summaryName) => {
	var result = await summaryInfo.findOne({ summaryName }, { repDate: 1, _id: 0 });
	if (result !== null) {
		return result.repDate;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};