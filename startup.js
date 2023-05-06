require('discord.js');
var dbCmds = require('./dbCmds.js');
var postEmbed = require('./postEmbed.js');
var editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	var oldEmbed = await dbCmds.readMsgId("embedMsg");

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
		await channel.messages.fetch(oldEmbed);
		editEmbed.editMainEmbed(client);
		return "edited";
	}
	catch (error) {
		postEmbed.postMainEmbed(client);
		return "posted";
	}
};