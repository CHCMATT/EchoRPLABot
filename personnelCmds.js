require('discord.js');
var dbCmds = require('./dbCmds.js');

module.exports.initPersonnel = async (client, userId) => {
	var guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
	var user = await guild.members.fetch(userId);
	var initCharName = user.nickname;
	var randomColor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
	await dbCmds.initPersStats(userId, initCharName, randomColor);
};