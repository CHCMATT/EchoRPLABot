var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.commissionReport = async (client) => {
	var lastRep = await dbCmds.readRepDate("lastCommissionReportDate");
	var lastRepDt = Number(lastRep.replaceAll('<t:', '').replaceAll(':d>', ''));
	var now = Math.floor(new Date().getTime() / 1000.0);
	var lastRepDiff = (now - lastRepDt);

	if (lastRepDiff >= 64800) {
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
		await editEmbed.editEmbed(client);

		if (commissionDescList == '') {
			commissionDescList = "There is no commission to pay this week."
		}

		var lastRep = await dbCmds.readRepDate("lastCommissionReportDate");

		if (lastRep.includes("Value not found")) {
			var nowMinus7 = now - 604800;
			var lastRep = `<t:${nowMinus7}:d>`
		}

		var embed = new EmbedBuilder()
			.setTitle(`Weekly Commission Report (\`${commissionPercent}\`) for ${lastRep} through ${today}:`)
			.setDescription(commissionDescList)
			.setColor('EDC531');

		await client.channels.cache.get(process.env.COMMISSION_REPORT_CHANNEL_ID).send({ embeds: [embed] });

		// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
		var now = Math.floor(new Date().getTime() / 1000.0);
		var repDate = `<t:${now}:d>`;

		await dbCmds.setRepDate("lastCommissionReportDate", repDate);

		var reason = `Automatic Commission Report Triggered on ${repDate}`;
		var notificationEmbed = new EmbedBuilder()
			.setTitle('Commission Modified Automatically:')
			.setDescription(`All salesperson's commissions have been reset to \`$0\`.\n\n**Reason:** ${reason}.`)
			.setColor('#1EC276');
		await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
		return "success";
	} else {
		return "fail";
	}
};