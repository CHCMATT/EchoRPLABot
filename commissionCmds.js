let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.commissionReport = async (client, type, who) => {
	try {
		let lastRep = await dbCmds.readRepDate("lastCommissionRepDate");
		let lastRepDt = Number(lastRep.replaceAll('<t:', '').replaceAll(':d>', ''));
		let now = Math.floor(new Date().getTime() / 1000.0);
		let dateTime = new Date().toString().slice(0, 24);
		let lastRepDiff = (now - lastRepDt);

		if (lastRepDiff == null || isNaN(lastRepDiff) || lastRepDiff <= 64800) {
			console.log(`${type} Commission report triggered by ${who} skipped at ${dateTime} (lastRepDiff: ${lastRepDiff})`)
			return "fail";
		} else {
			let now = Math.floor(new Date().getTime() / 1000.0);
			let today = `<t:${now}:d>`;

			let peopleArray = await dbCmds.commissionRep();
			peopleArray.sort((a, b) => {
				return b.currentCommission - a.currentCommission;
			});
			let commissionDescList = '';

			let weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

			for (i = 0; i < peopleArray.length; i++) {
				currentCommission = peopleArray[i].currentCommission;

				if (!peopleArray[i].bankAccount) {
					peopleArray[i].bankAccount = 'N/A';
				}

				commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}** (\`${peopleArray[i].bankAccount}\`): ${formatter.format(currentCommission)}\n`);

				await dbCmds.resetCommission(peopleArray[i].discordId);
			}

			await dbCmds.resetSummValue("countWeeklyCarsSold");
			await editEmbed.editMainEmbed(client);
			await editEmbed.editMgmtStatsEmbed(client);
			await editEmbed.editSalespersonStatsEmbed(client);

			if (commissionDescList == '') {
				commissionDescList = "There is no commission to pay this week."
			}

			if (lastRep.includes("Value not found")) {
				let nowMinus7 = now - 604800;
				lastRep = `<t:${nowMinus7}:d>`
			}

			let embed = new EmbedBuilder()
				.setTitle(`${type} Commission Report (\`${weeklyCarsSold}\` sales) for ${lastRep} through ${today}:`)
				.setDescription(commissionDescList)
				.setColor('90E0EF');

			await client.channels.cache.get(process.env.COMMISSION_REPORT_CHANNEL_ID).send({ embeds: [embed] });

			// success/fail color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
			await dbCmds.setRepDate("lastCommissionRepDate", today);

			let reason = `${type} Commission Report triggered by ${who} on ${today}`
			let notificationEmbed = new EmbedBuilder()
				.setTitle('Commission Modified Automatically:')
				.setDescription(`All salesperson's commissions have been reset to \`$0\`.\n\n**Reason:** ${reason}.`)
				.setColor('1EC276');
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
			return "success";
		}
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
					{ name: `Server name:`, value: `${interaction.member.guild.name}`, inline: true },
				)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};