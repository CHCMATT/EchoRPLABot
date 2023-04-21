require('discord.js');
var dbCmds = require('./dbCmds.js');
var postEmbed = require('./postEmbed.js');
var editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	var oldEmbed = await dbCmds.readMsgId("embedMsg");

	try {
		await channel.messages.fetch(oldEmbed);
		editEmbed.editEmbed(client);
	}
	catch (error) {
		postEmbed.postEmbed(client);
	}

	var now = Math.floor(new Date().getTime() / 1000.0);
	var time = `<t:${now}:t>`;

	await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send(`:bangbang: The ${process.env.BOT_NAME} bot started up at ${time}.`)
};