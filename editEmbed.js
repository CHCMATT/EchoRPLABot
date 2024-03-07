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
			.setTitle('Cars Sold Overall:')
			.setDescription(countCarsSold)
			.setColor('023E8A');

		let weeklyCarsSoldEmbed = new EmbedBuilder()
			.setTitle('Cars Sold This Week:')
			.setDescription(countWeeklyCarsSold)
			.setColor('0077B6');

		let currEmbed = await dbCmds.readMsgId("embedMsg");

		let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
		let currMsg = await channel.messages.fetch(currEmbed);

		let btnRows = addBtnRows();

		currMsg.edit({ embeds: [carsSoldEmbed, weeklyCarsSoldEmbed], components: btnRows });
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.error(errTime, fileName, error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];
			console.error(errTime, fileName, error);

			console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

			let errString = error.toString();
			let errHandled = false;

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.addFields(
					{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
					{ name: `Error handled?`, value: `${errHandled}`, inline: true },
				)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};

module.exports.editMgmtStatsEmbed = async (client) => {
	try {
		let empStats = await dbCmds.currStats();

		let guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
		let guildMembers = await guild.members.fetch();
		let arrayOfMembers = [];
		guildMembers.forEach((member) => arrayOfMembers.push(member.id));

		let statsDescList = '';

		empStats.sort((a, b) => {
			let fa = a.charName.toLowerCase(),
				fb = b.charName.toLowerCase();
			if (fa < fb) { return -1; }
			if (fa > fb) { return 1; }
			return 0;
		});

		empStats = empStats.filter((employee) => arrayOfMembers.includes(employee.discordId));

		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		for (i = 0; i < empStats.length; i++) {
			if ((empStats[i].carsSold > 0 || empStats[i].weeklyCarsSold > 0 || empStats[i].currentCommission > 0)) {
				statsDescList = statsDescList.concat(`<@${empStats[i].discordId}>\n`);
			}
			if (empStats[i].carsSold > 0) {
				statsDescList = statsDescList.concat(`• ** Cars Sold Overall:** ${empStats[i].carsSold}\n`);
			}
			if (empStats[i].weeklyCarsSold > 0) {
				statsDescList = statsDescList.concat(`• ** Sales This Week:** ${empStats[i].weeklyCarsSold}\n`);
			}
			if (empStats[i].currentCommission > 0) {
				statsDescList = statsDescList.concat(`• ** Weekly Commission:** ${formatter.format(empStats[i].currentCommission)}\n`);
			}
			if (empStats[i].carsSold > 0 || empStats[i].weeklyCarsSold > 0 || empStats[i].currentCommission > 0) {
				statsDescList = statsDescList.concat(`\n`);
			}
		}

		if (statsDescList == '') {
			statsDescList = "There are no salesperson statistics to display yet."
		}

		// theme color palette: https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8

		let statsEmbed = new EmbedBuilder()
			.setTitle(`Management Statistics as of ${today}:`)
			.setDescription(statsDescList)
			.setColor('90E0EF');

		let statsEmbedId = await dbCmds.readMsgId("mgmtStatsMsg");
		let channel = await client.channels.fetch(process.env.MGMT_STATS_CHANNEL_ID)
		let mgmtStatsMsg = await channel.messages.fetch(statsEmbedId);

		mgmtStatsMsg.edit({ embeds: [statsEmbed] });

	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.error(errTime, fileName, error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];
			console.error(errTime, fileName, error);

			console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

			let errString = error.toString();
			let errHandled = false;

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.addFields(
					{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
					{ name: `Error handled?`, value: `${errHandled}`, inline: true },
				)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};

module.exports.editSalespersonStatsEmbed = async (client) => {
	try {
		let empStats = await dbCmds.currStats();

		let statsDescList = '';

		empStats.sort((a, b) => {
			let fa = a.charName.toLowerCase(),
				fb = b.charName.toLowerCase();
			if (fa < fb) { return -1; }
			if (fa > fb) { return 1; }
			return 0;
		});

		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		for (i = 0; i < empStats.length; i++) {
			if (empStats[i].weeklyCarsSold > 0) {
				statsDescList = statsDescList.concat(`<@${empStats[i].discordId}>\n`);
			}
			if (empStats[i].weeklyCarsSold > 0) {
				statsDescList = statsDescList.concat(`• ** Sales This Week:** ${empStats[i].weeklyCarsSold}\n\n`);
			}
		}

		if (statsDescList == '') {
			statsDescList = "There are no salesperson statistics to display yet."
		}

		// theme color palette: https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8

		let statsEmbed = new EmbedBuilder()
			.setTitle(`Salesperson Statistics as of ${today}:`)
			.setDescription(statsDescList)
			.setColor('90E0EF');

		let statsEmbedId = await dbCmds.readMsgId("salespersonStatsMsg");
		let channel = await client.channels.fetch(process.env.SALESPERSON_STATS_CHANNEL_ID)
		let salespersonStatsMsg = await channel.messages.fetch(statsEmbedId);

		salespersonStatsMsg.edit({ embeds: [statsEmbed] });

	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.error(errTime, fileName, error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];
			console.error(errTime, fileName, error);

			console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

			let errString = error.toString();
			let errHandled = false;

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.addFields(
					{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
					{ name: `Error handled?`, value: `${errHandled}`, inline: true },
				)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('logSaleDropdown')
			.setLabel('Log a Sale')
			.setStyle(ButtonStyle.Primary),

		new ButtonBuilder()
			.setCustomId('logCarRental')
			.setLabel('Log a Car Rental')
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