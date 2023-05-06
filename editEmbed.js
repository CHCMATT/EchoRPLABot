var dbCmds = require('./dbCmds.js');
var { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.editMainEmbed = async (client) => {
	let countCarsSold = await dbCmds.readSummValue("countCarsSold");
	let countWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

	// Color Palette: https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8

	countCarsSold = countCarsSold.toString();
	countWeeklyCarsSold = countWeeklyCarsSold.toString();

	var carsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Cars Sold:')
		.setDescription(countCarsSold)
		.setColor('00B4D8');

	var weeklyCarsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Cars Sold This Week:')
		.setDescription(countWeeklyCarsSold)
		.setColor('48CAE4');

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

module.exports.editStatsEmbed = async (client) => {
	var employeeStats = await dbCmds.currStats();
	var embeds = [];

	for (var i = 0; i < employeeStats.length; i++) {
		var charName = employeeStats[i].charName;
		var embedColor = employeeStats[i].embedColor;
		var carsSold = employeeStats[i].carsSold;
		var weeklyCarsSold = employeeStats[i].weeklyCarsSold;
		var commission25Percent = employeeStats[i].commission25Percent;
		var commission30Percent = employeeStats[i].commission30Percent;
		var formattedComm25Percent = formatter.format(commission25Percent);
		var formattedComm30Percent = formatter.format(commission30Percent);


		var currEmbed = new EmbedBuilder().setTitle(`Luxury Autos statistics for ${charName}:`).setColor(embedColor).setDescription(`• **Cars Sold:** ${carsSold}
		• **Weekly Cars Sold:** ${weeklyCarsSold}
		• **Current Commission (25%):** ${formattedComm25Percent}
		• **Current Commission (30%):** ${formattedComm30Percent}`);

		embeds = embeds.concat(currEmbed);
	}

	var currEmbed = await dbCmds.readMsgId("statsMsg");
	var channel = await client.channels.fetch(process.env.PERSONNEL_STATS_CHANNEL_ID)
	var currMsg = await channel.messages.fetch(currEmbed);

	currMsg.edit({ embeds: embeds });
};