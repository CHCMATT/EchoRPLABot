let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.editMainEmbed = async (client) => {
	try {
		let countCarsSold = await dbCmds.readSummValue("countCarsSold");
		let countWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

		// theme color palette: https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8

		countCarsSold = countCarsSold.toString();
		countWeeklyCarsSold = countWeeklyCarsSold.toString();

		let carsSoldEmbed = new EmbedBuilder()
			.setTitle('Amount of Cars Sold:')
			.setDescription(countCarsSold)
			.setColor('023E8A');

		let weeklyCarsSoldEmbed = new EmbedBuilder()
			.setTitle('Amount of Cars Sold This Week:')
			.setDescription(countWeeklyCarsSold)
			.setColor('0077B6');

		let currEmbed = await dbCmds.readMsgId("embedMsg");

		let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
		let currMsg = await channel.messages.fetch(currEmbed);

		let btnRows = addBtnRows();

		currMsg.edit({ embeds: [carsSoldEmbed, weeklyCarsSoldEmbed], components: btnRows });
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

			console.log(`Error occured at ${errTime} at file ${fileName}!`);
			console.error(error);
		}
	}
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
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

		new ButtonBuilder()
			.setCustomId('addCarRental')
			.setLabel('Add a Car Rental')
			.setStyle(ButtonStyle.Secondary),
	);

	let row2 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addYPAdvert')
			.setLabel('Log a YP Ad')
			.setStyle(ButtonStyle.Secondary),
	);

	let rows = [row1, row2];
	return rows;
};

module.exports.editStatsEmbed = async (client) => {
	try {
		let empStats = await dbCmds.currStats();
		let currentDescList = '';

		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		for (i = 0; i < empStats.length; i++) {
			if (empStats[i].weeklyCarsSold > 0) {
				currentDescList = currentDescList.concat(`<@${empStats[i].discordId}>
	• **Cars Sold Overall:** ${empStats[i].carsSold}
	• **Cars Sold This Week:** ${empStats[i].weeklyCarsSold}
	• **Current Commission:** ${formatter.format(empStats[i].currentCommission)}\n\n`);
			}
		}

		if (currentDescList == '') {
			currentDescList = "There is no salesperson data to display yet."
		}

		let embed = new EmbedBuilder()
			.setTitle(`Salesperson Data as of ${today}:`)
			.setDescription(currentDescList)
			.setColor('ADE8F4');

		let statsEmbed = await dbCmds.readMsgId("statsMsg");
		let channel = await client.channels.fetch(process.env.PERSONNEL_STATS_CHANNEL_ID)
		let statsMsg = await channel.messages.fetch(statsEmbed);

		statsMsg.edit({ embeds: [embed] });
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

			console.log(`Error occured at ${errTime} at file ${fileName}!`);
			console.error(error);
		}
	}
};