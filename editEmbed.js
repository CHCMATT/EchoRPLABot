var dbCmds = require('./dbCmds.js');
var { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client) => {
	let countCarsSold = await dbCmds.readSummValue("countCarsSold");
	let countWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

	// Color Palette: https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8

	countCarsSold = countCarsSold.toString();
	countWeeklyCarsSold = countWeeklyCarsSold.toString();

	var carsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Cars Sold:')
		.setDescription(countCarsSold)
		.setColor('#00B4D8');

	var weeklyCarsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Cars Sold This Week:')
		.setDescription(countWeeklyCarsSold)
		.setColor('#48CAE4');

	var currEmbed = await dbCmds.readMsgId("embedMsg");

	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	var currMsg = await channel.messages.fetch(currEmbed);

	var btnRows = addBtnRows();

	currMsg.edit({ embeds: [carsSoldEmbed, weeklyCarsSoldEmbed], components: btnRows });
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

		new ButtonBuilder()
			.setCustomId('addEmployeeSale')
			.setLabel('Add an Employee Sale')
			.setStyle(ButtonStyle.Primary),
	);

	var rows = [row1];
	return rows;
};