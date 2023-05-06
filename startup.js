require('discord.js');
var dbCmds = require('./dbCmds.js');
var postEmbed = require('./postEmbed.js');
var editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	var mainChannel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	var statsChannel = await client.channels.fetch(process.env.PERSONNEL_STATS_CHANNEL_ID);
	var mainEmbed = await dbCmds.readMsgId("embedMsg");
	var statsEmbed = await dbCmds.readMsgId("statsMsg");


	let countCarsSold = await dbCmds.readSummValue("countCarsSold");
	countCarsSold = countCarsSold.toString();

	let countWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");
	countWeeklyCarsSold = countWeeklyCarsSold.toString();

	let lastCommissionReportDate = await dbCmds.readRepDate("lastCommissionReportDate");
	lastCommissionReportDate = lastCommissionReportDate.toString();


	if (countCarsSold.includes('Value not found')) {
		await dbCmds.resetSummValue("countCarsSold");
	}

	if (countWeeklyCarsSold.includes('Value not found')) {
		await dbCmds.resetSummValue("countWeeklyCarsSold");
	}

	if (lastCommissionReportDate.includes('Value not found')) {
		await dbCmds.resetSummValue("lastCommissionReportDate");
	}

	try {
		await statsChannel.messages.fetch(statsEmbed);
		editEmbed.editStatsEmbed(client);
	}
	catch (error) {
		postEmbed.postStatsEmbed(client);
	}

	try {
		await mainChannel.messages.fetch(mainEmbed);
		editEmbed.editMainEmbed(client);
		return "edited";
	}
	catch (error) {
		postEmbed.postMainEmbed(client);
		return "posted";
	}
};