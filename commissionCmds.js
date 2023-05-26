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

		if (lastRepDiff == null || isNaN(lastRepDiff) || lastRepDiff >= 64800) {
			console.log(`${type} Commission report triggered by ${who} skipped at ${dateTime} (lastRepDiff: ${lastRepDiff})`)
			return "fail";
		} else {
			let now = Math.floor(new Date().getTime() / 1000.0);
			let today = `<t:${now}:d>`;

			let peopleArray = await dbCmds.commissionRep();
			peopleArray.sort((a, b) => {
				return b.commission25Percent - a.commission25Percent;
			});
			let commissionDescList = '';

			let weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

			for (i = 0; i < peopleArray.length; i++) {
				if (weeklyCarsSold < 100) {
					currentCommission = peopleArray[i].commission25Percent;
				} else {
					currentCommission = peopleArray[i].commission30Percent;
				}

				commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}** (\`${peopleArray[i].bankAccount}\`): ${formatter.format(currentCommission)}\n`);

				await dbCmds.resetCommission(peopleArray[i].discordId);
			}

			if (weeklyCarsSold < 100) {
				commissionPercent = "25%";
			} else {
				commissionPercent = "30%";
			}

			await dbCmds.resetSummValue("countWeeklyCarsSold");
			await editEmbed.editMainEmbed(client);
			await editEmbed.editStatsEmbed(client);

			if (commissionDescList == '') {
				commissionDescList = "There is no commission to pay this week."
			}

			if (lastRep.includes("Value not found")) {
				let nowMinus7 = now - 604800;
				lastRep = `<t:${nowMinus7}:d>`
			}

			let embed = new EmbedBuilder()
				.setTitle(`${type} Commission Report (\`${commissionPercent}\`) for ${lastRep} through ${today}:`)
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
		let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		let fileParts = __filename.split(/[\\/]/);
		let fileName = fileParts[fileParts.length - 1];

		let errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};