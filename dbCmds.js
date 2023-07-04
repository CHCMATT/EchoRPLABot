let summaryInfo = require('./schemas/summaryInfo');
let personnelInfo = require('./schemas/personnelInfo');

module.exports.readSummValue = async (summaryName) => {
	let result = await summaryInfo.findOne({ summaryName }, { value: 1, _id: 0 });
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
module.exports.initPersStats = async (discordId, discordNickname) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { discordId: discordId, charName: discordNickname, carsSold: 0, weeklyCarsSold: 0, currentCommission: 0 }, { upsert: true });
};

module.exports.readPersStats = async (discordId) => {
	let result = await personnelInfo.findOne({ discordId: discordId }, { discordId: 1, charName: 1, embedMsgId: 1, embedColor: 1, carsSold: 1, currentCommission: 1, bankAccount: 1, weeklyCarsSold: 1, _id: 0 });
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

module.exports.setCharName = async (discordId, charName) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { charName: charName }, { upsert: true });
};



//personnel message id stuff
module.exports.setPersonnelMsgId = async (discordId, embedId) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { embedMsgId: embedId }, { upsert: true });
};

module.exports.readPersonnelMsgId = async (discordId) => {
	let result = await personnelInfo.findOne({ discordId: discordId }, { embedMsgId: 1, _id: 0 });
	return result.embedMsgId;
};


// commission stuff
module.exports.addCommission = async (discordId, commission) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: commission } }, { upsert: true });
};

module.exports.removeCommission = async (discordId, commission) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: -commission } }, { upsert: true });
};

module.exports.resetCommission = async (discordId) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { currentCommission: 0 });
};

module.exports.readCommission = async (discordId) => {
	let result = await personnelInfo.findOne({ discordId: discordId }, { currentCommission: 1, _id: 0 });
	return result.currentCommission;
};

module.exports.commissionRep = async () => {
	let result = await personnelInfo.find({ currentCommission: { $gt: 0 } }, { discordId: 1, charName: 1, currentCommission: 1, bankAccount: 1, _id: 0 });
	return result;
};


// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await summaryInfo.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	let result = await summaryInfo.findOne({ summaryName }, { msgId: 1, _id: 0 });
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
	let result = await summaryInfo.findOne({ summaryName }, { repDate: 1, _id: 0 });
	if (result !== null) {
		return result.repDate;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};

module.exports.currStats = async () => {
	let result = await personnelInfo.find({ charName: { $ne: null } }, { discordId: 1, charName: 1, embedColor: 1, carsSold: 1, weeklyCarsSold: 1, currentCommission: 1, _id: 0 });
	return result;
};

module.exports.weeklyStatsRep = async () => {
	let result = await personnelInfo.find({ charName: { $ne: null } }, { discordId: 1, charName: 1, carsSold: 1, weeklyCarsSold: 1, _id: 0 });
	return result;
};

module.exports.resetWeeklyStats = async (discordId) => {
	await personnelInfo.findOneAndUpdate({ discordId: discordId }, { weeklyCarsSold: 0 }, { upsert: true });
};