var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');

module.exports.statsReport = async (client) => {
	try {
		var lastRep = await dbCmds.readRepDate("lastStatsRepDate");
		var now = Math.floor(new Date().getTime() / 1000.0);
		var today = `<t:${now}:d>`;

		var statsArray = await dbCmds.weeklyStatsRep();
		var statsDescList = '';

		for (i = 0; i < statsArray.length; i++) {
			if (statsArray[i].weeklyCarsSold > 0) {
				statsDescList = statsDescList.concat(`__${statsArray[i].charName}__:
• **Cars Sold Overall:** ${statsArray[i].carsSold}
• **Cars Sold This Week:** ${statsArray[i].weeklyCarsSold}\n\n`);
				await dbCmds.resetWeeklyStats(statsArray[i].discordId);
			}
		}

		if (statsDescList == '') {
			statsDescList = "There were no sales this week."
		}

		await editEmbed.editMainEmbed(client);
		await editEmbed.editStatsEmbed(client);

		if (lastRep == null || lastRep.includes("Value not found")) {
			var nowMinus7 = now - 604800;
			var lastRep = `<t:${nowMinus7}:d>`
		}

		var embed = new EmbedBuilder()
			.setTitle(`Salesperson Stats Report for ${lastRep} through ${today}:`)
			.setDescription(statsDescList)
			.setColor('ADE8F4');
		await client.channels.cache.get(process.env.CEO_GENERAL_CHANNEL_ID).send({ embeds: [embed] });

		// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
		await dbCmds.setRepDate("lastStatsRepDate", today);
		return "success";
	} catch (error) {
		var errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		var fileParts = __filename.split(/[\\/]/);
		var fileName = fileParts[fileParts.length - 1];

		var errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await interaction.client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};