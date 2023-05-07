var { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
var dbCmds = require('./dbCmds.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.postMainEmbed = async (client) => {
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

	var btnRows = addBtnRows();

	client.embedMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [carsSoldEmbed, weeklyCarsSoldEmbed], components: btnRows });

	await dbCmds.setMsgId("embedMsg", client.embedMsg.id);
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

module.exports.postStatsEmbed = async (client) => {
	var employeeStats = await dbCmds.currStats();
	var currentDescList = '';

	var now = Math.floor(new Date().getTime() / 1000.0);
	var today = `<t:${now}:d>`;

	for (i = 0; i < employeeStats.length; i++) {
		if (employeeStats[i].weeklyCarsSold > 0) {
			currentDescList = currentDescList.concat(`__${employeeStats[i].charName}__:
	• **Cars Sold Overall:** ${employeeStats[i].carsSold}
	• **Cars Sold This Week:** ${employeeStats[i].weeklyCarsSold}
	• **Current Commission (25%):** ${formatter.format(employeeStats[i].commission25Percent)}
	• **Current Commission (30%):** ${formatter.format(employeeStats[i].commission30Percent)}\n\n`);
		}
	}

	var embed = new EmbedBuilder()
		.setTitle(`Salesman Data as of ${today}:`)
		.setDescription(currentDescList)
		.setColor('ADE8F4');

	client.statsMsg = await client.channels.cache.get(process.env.PERSONNEL_STATS_CHANNEL_ID).send({ embeds: [embed] });

	await dbCmds.setMsgId("statsMsg", client.statsMsg.id);
};