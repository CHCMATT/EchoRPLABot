require('discord.js');
let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let postEmbed = require('./postEmbed.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');


module.exports.startUp = async (client) => {
	let mainChannel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	let statsChannel = await client.channels.fetch(process.env.PERSONNEL_STATS_CHANNEL_ID);
	let mainEmbed = await dbCmds.readMsgId("embedMsg");
	let statsEmbed = await dbCmds.readMsgId("statsMsg");

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
		await statsChannel.messages.fetch(statsEmbed);
		editEmbed.editStatsEmbed(client);
	}
	catch {
		postEmbed.postStatsEmbed(client);
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