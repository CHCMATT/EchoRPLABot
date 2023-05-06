var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');

module.exports.statsReport = async (client) => {
	var lastRep = await dbCmds.readRepDate("lastStatsRepDate");
	var now = Math.floor(new Date().getTime() / 1000.0);
	var today = `<t:${now}:d>`;

	var statsArray = await dbCmds.weeklyStatsRep();
	var statsDescList = '';

	for (i = 0; i < statsArray.length; i++) {
		statsDescList = statsDescList.concat(`__${statsArray[i].charName}__:
• **Cars Sold Overall:** ${statsArray[i].carsSold}
• **Cars Sold This Week:** ${statsArray[i].weeklyCarsSold}\n\n`);
		await dbCmds.resetWeeklyStats(statsArray[i].discordId);
	}

	await editEmbed.editMainEmbed(client);
	await editEmbed.editStatsEmbed(client);

	if (lastRep == null || lastRep.includes("Value not found")) {
		var nowMinus7 = now - 604800;
		var lastRep = `<t:${nowMinus7}:d>`
	}

	var embed = new EmbedBuilder()
		.setTitle(`Weekly Salesman Stats Report for ${lastRep} through ${today}:`)
		.setDescription(statsDescList)
		.setColor('ADE8F4');
	await client.channels.cache.get(process.env.CEO_GENERAL_CHANNEL_ID).send({ embeds: [embed] });

	// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
	await dbCmds.setRepDate("lastStatsRepDate", today);

};