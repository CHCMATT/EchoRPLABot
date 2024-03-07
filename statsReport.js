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

		let statsDescList = '';

		for (i = 0; i < statsArray.length; i++) {
			if (statsArray[i].weeklyCarsSold > 0) {
				statsDescList = statsDescList.concat(`__${statsArray[i].charName}__:
• **Cars Sold Overall:** ${statsArray[i].carsSold}
• **Cars Sold This Week:** ${statsArray[i].weeklyCarsSold}\n\n`);
				await dbCmds.resetWeeklyStats(statsArray[i].discordId);
			}
		}

		if (statsDescList == '') {
			statsDescList = "There were no sales this week."
		}

		await editEmbed.editMainEmbed(client);
		await editEmbed.editMgmtStatsEmbed(client);

		if (lastRep == null || lastRep.includes("Value not found")) {
			let nowMinus7 = now - 604800;
			let lastRep = `<t:${nowMinus7}:d>`
		}

		let embed = new EmbedBuilder()
			.setTitle(`Salesperson Stats Report for ${lastRep} through ${today}:`)
			.setDescription(statsDescList)
			.setColor('ADE8F4');
		await client.channels.cache.get(process.env.CEO_GENERAL_CHANNEL_ID).send({ embeds: [embed] });

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

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
				try {
					await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				} catch {
					await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				}
				errHandled = true;
			}

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