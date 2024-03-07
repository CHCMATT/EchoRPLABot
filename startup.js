require('discord.js');
let dbCmds = require('./dbCmds.js');
let postEmbed = require('./postEmbed.js');
let editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	let mainChannel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	let mgmtStatsChannel = await client.channels.fetch(process.env.MGMT_STATS_CHANNEL_ID);
	let salespersonStatsChannel = await client.channels.fetch(process.env.SALESPERSON_STATS_CHANNEL_ID);
	let mainEmbed = await dbCmds.readMsgId("embedMsg");
	let mgmtStatsEmbed = await dbCmds.readMsgId("mgmtStatsMsg");
	let salespersonStatsEmbed = await dbCmds.readMsgId("salespersonStatsMsg");

	let countCarsSold = await dbCmds.readSummValue("countCarsSold");
	countCarsSold = countCarsSold.toString();
	let countWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");
	countWeeklyCarsSold = countWeeklyCarsSold.toString();
	let lastCommissionRepDate = await dbCmds.readRepDate("lastCommissionRepDate");
	lastCommissionRepDate = lastCommissionRepDate.toString();

	if (countCarsSold.includes('Value not found')) {
		await dbCmds.resetSummValue("countCarsSold");
	}

	if (countWeeklyCarsSold.includes('Value not found')) {
		await dbCmds.resetSummValue("countWeeklyCarsSold");
	}

	if (lastCommissionRepDate.includes('Value not found')) {
		await dbCmds.resetSummValue("lastCommissionRepDate");
	}

	try {
		await mgmtStatsChannel.messages.fetch(mgmtStatsEmbed);
		editEmbed.editMgmtStatsEmbed(client);
	}
	catch {
		postEmbed.postMgmtStatsEmbed(client);
	}

	try {
		await salespersonStatsChannel.messages.fetch(salespersonStatsEmbed);
		editEmbed.editSalespersonStatsEmbed(client);
	}
	catch {
		postEmbed.postSalespersonStatsEmbed(client);
	}

	try {
		await mainChannel.messages.fetch(mainEmbed);
		editEmbed.editMainEmbed(client);
		return "edited";
	}
	catch {
		postEmbed.postMainEmbed(client);
		return "posted";
	}
};