require('discord.js');
var dbCmds = require('./dbCmds.js');
var postEmbed = require('./postEmbed.js');
var editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	try {
		var mainChannel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
		var statsChannel = await client.channels.fetch(process.env.PERSONNEL_STATS_CHANNEL_ID);
		var mainEmbed = await dbCmds.readMsgId("embedMsg");
		var statsEmbed = await dbCmds.readMsgId("statsMsg");


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
	} catch (error) {
		var errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		var fileParts = __filename.split(/[\\/]/);
		var fileName = fileParts[fileParts.length - 1];

		var errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};