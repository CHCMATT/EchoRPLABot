require('discord.js');
var { EmbedBuilder } = require('discord.js');
var dbCmds = require('./dbCmds.js');

module.exports.initPersonnel = async (client, userId) => {
	var guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
	var user = await guild.members.fetch(userId);
	var initCharName = user.nickname;
	var randomColor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
	await dbCmds.initPersStats(userId, initCharName, randomColor);
};

module.exports.sendOrUpdateEmbed = async (client, userId) => {
	var personnelData = await dbCmds.readPersStats(userId);
	var embedMsgId = personnelData.embedMsgId;
	if (embedMsgId) { // if embed exists, then we edit the existing embed
		var embedMsgId = personnelData.embedMsgId;
		var charName = personnelData.charName;
		var embedColor = personnelData.embedColor;
		var carsSold = personnelData.carsSold;

		var embedDesc = `• **Cars Sold:** ${carsSold}`;

		var personnelEmbed = new EmbedBuilder()
			.setTitle(`Luxury Autos statistics for ${charName}:`)
			.setDescription(embedDesc)
			.setColor(embedColor);

		var channel = await client.channels.fetch(process.env.PERSONNEL_STATS_CHANNEL_ID)
		var personnelEmbedMsg = await channel.messages.fetch(embedMsgId);

		personnelEmbedMsg.edit({ embeds: [personnelEmbed] });
	}
	else { // if embed doesn't exist, then we post a new embed
		var charName = personnelData.charName;
		var embedColor = personnelData.embedColor;
		var carsSold = personnelData.carsSold;

		var embedDesc = `• **Cars Sold:** ${carsSold}`;

		var personnelEmbed = new EmbedBuilder()
			.setTitle(`Luxury Autos statistics for ${charName}:`)
			.setDescription(embedDesc)
			.setColor(embedColor);

		var personnelEmbedMsg = await client.channels.cache.get(process.env.PERSONNEL_STATS_CHANNEL_ID).send({ embeds: [personnelEmbed] });

		await dbCmds.setPersonnelMsgId(userId, personnelEmbedMsg.id);
	}
};