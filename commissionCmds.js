var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.commissionReport = async (client, type, who) => {
	try {
		var lastRep = await dbCmds.readRepDate("lastCommissionRepDate");
		var lastRepDt = Number(lastRep.replaceAll('<t:', '').replaceAll(':d>', ''));
		var now = Math.floor(new Date().getTime() / 1000.0);
		var dateTime = new Date().toString().slice(0, 24);
		var lastRepDiff = (now - lastRepDt);

		if (lastRepDiff == null || isNaN(lastRepDiff) || lastRepDiff <= 64800) {
			console.log(`${type} Commission report triggered by ${who} skipped at ${dateTime} (lastRepDiff: ${lastRepDiff})`)
			return "fail";
		} else {
			var now = Math.floor(new Date().getTime() / 1000.0);
			var today = `<t:${now}:d>`;

			var peopleArray = await dbCmds.commissionRep();
			var commissionDescList = '';

			var weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

			for (i = 0; i < peopleArray.length; i++) {
				if (weeklyCarsSold < 100) {
					var currentCommission = peopleArray[i].commission25Percent;
				} else {
					var currentCommission = peopleArray[i].commission30Percent;
				}

				commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}** (\`${peopleArray[i].bankAccount}\`): ${formatter.format(currentCommission)}\n`);

				await dbCmds.resetCommission(peopleArray[i].discordId);
			}

			if (weeklyCarsSold < 100) {
				var commissionPercent = "25%";
			} else {
				var commissionPercent = "30%";
			}

			await dbCmds.resetSummValue("countWeeklyCarsSold");
			await editEmbed.editMainEmbed(client);
			await editEmbed.editStatsEmbed(client);

			if (commissionDescList == '') {
				commissionDescList = "There is no commission to pay this week."
			}

			if (lastRep.includes("Value not found")) {
				var nowMinus7 = now - 604800;
				var lastRep = `<t:${nowMinus7}:d>`
			}

			var embed = new EmbedBuilder()
				.setTitle(`${type} Commission Report (\`${commissionPercent}\`) for ${lastRep} through ${today}:`)
				.setDescription(commissionDescList)
				.setColor('90E0EF');

			await client.channels.cache.get(process.env.COMMISSION_REPORT_CHANNEL_ID).send({ embeds: [embed] });

			// success/fail color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
			await dbCmds.setRepDate("lastCommissionRepDate", today);

			var reason = `${type} Commission Report triggered by ${who} on ${today}`
			var notificationEmbed = new EmbedBuilder()
				.setTitle('Commission Modified Automatically:')
				.setDescription(`All salesperson's commissions have been reset to \`$0\`.\n\n**Reason:** ${reason}.`)
				.setColor('1EC276');
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
			return "success";
		}
	} catch (error) {
		var errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		var fileParts = __filename.split(/[\\/]/);
		var fileName = fileParts[fileParts.length - 1];

		var errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await interaction.client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};