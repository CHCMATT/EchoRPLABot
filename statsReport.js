let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');

module.exports.statsReport = async (client) => {
	try {
		let lastRep = await dbCmds.readRepDate("lastStatsRepDate");
		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		let statsArray = await dbCmds.weeklyStatsRep();

		statsArray.sort((a, b) => {
			let fa = a.charName.toLowerCase(),
				fb = b.charName.toLowerCase();
			if (fa < fb) { return -1; }
			if (fa > fb) { return 1; }
			return 0;
		});

		let guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
		let guildMembers = await guild.members.fetch();
		let arrayOfMembers = [];
		guildMembers.forEach((member) => arrayOfMembers.push(member.id));

		let statsDescList = '';
		let noSalesDescList = '';

		for (i = 0; i < statsArray.length; i++) {
			if (statsArray[i].weeklyCarsSold > 0) {
				statsDescList = statsDescList.concat(`__${statsArray[i].charName}__:\n• **Cars Sold Overall:** ${statsArray[i].carsSold}\n• **Cars Sold This Week:** ${statsArray[i].weeklyCarsSold}\n\n`);
				await dbCmds.resetWeeklyStats(statsArray[i].discordId);
			}

			if (arrayOfMembers.includes(statsArray[i].discordId)) {
				if (statsArray[i].weeklyCarsSold < 5 || statsArray[i].weeklyCarsSold == null || statsArray[i].weeklyCarsSold == '') {
					let weeklySales;

					if (statsArray[i].weeklyCarsSold == null || statsArray[i].weeklyCarsSold == '') {
						weeklySales = 0;
					} else {
						weeklySales = statsArray[i].weeklyCarsSold;
					}

					noSalesDescList = noSalesDescList.concat(`__${statsArray[i].charName}__:\n• **Cars Sold Overall:** ${statsArray[i].carsSold}\n• **Cars Sold This Week:** ${weeklySales}\n\n`);
				}
			}
		}

		if (statsDescList == '') {
			statsDescList = "There were no sales this week."
		}

		if (noSalesDescList == '') {
			noSalesDescList = "There were no dealers with less than 5 sales this week!"
		}

		await editEmbed.editMainEmbed(client);
		await editEmbed.editMgmtStatsEmbed(client);

		if (lastRep == null || lastRep.includes("Value not found")) {
			let nowMinus7 = now - 604800;
			lastRep = `<t:${nowMinus7}:d>`
		}

		let statsEmbed = new EmbedBuilder()
			.setTitle(`Salespeople Stats Report for ${lastRep} through ${today}:`)
			.setDescription(statsDescList)
			.setColor('ADE8F4');

		let noSalesEmbed = new EmbedBuilder()
			.setTitle(`Salespeople Under Quota Report for ${lastRep} through ${today}:`)
			.setDescription(noSalesDescList)
			.setColor('CAF0F8');

		await client.channels.cache.get(process.env.CEO_GENERAL_CHANNEL_ID).send({ embeds: [statsEmbed, noSalesEmbed] });

		// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
		await dbCmds.setRepDate("lastStatsRepDate", today);
		return "success";
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
					{ name: `Server name:`, value: `${interaction.member.guild.name}`, inline: true },
				)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};