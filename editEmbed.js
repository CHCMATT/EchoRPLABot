var dbCmds = require('./dbCmds.js');
var { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client) => {
	let countCarsSold = await dbCmds.readSummValue("countCarsSold");

	// Color Palette: https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8

	countCarsSold = countCarsSold.toString();

	var carsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Cars Sold:')
		.setDescription(countCarsSold)
		.setColor('#03045E');

	var currEmbed = await dbCmds.readMsgId("embedMsg");

	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	var currMsg = await channel.messages.fetch(currEmbed);

	var btnRows = addBtnRows();

	currMsg.edit({ embeds: [carsSoldEmbed], components: btnRows });
};

function addBtnRows() {
	var row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addRegularCarSale')
			.setLabel('Add a Regular Car Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addSportsCarSale')
			.setLabel('Add a Sports Car Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addTunerCarSale')
			.setLabel('Add a Tuner Car Sale')
			.setStyle(ButtonStyle.Success),
	);

	var rows = [row1];
	return rows;
};