require('discord.js');
var dbCmds = require('./dbCmds.js');
var { EmbedBuilder } = require('discord.js');

module.exports.initPersonnel = async (client, userId) => {
	try {
		var guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
		var user = await guild.members.fetch(userId);
		var initCharName = user.nickname;
		await dbCmds.initPersStats(userId, initCharName);
	}
	catch (error) {
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