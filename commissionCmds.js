var { EmbedBuilder } = require('discord.js');
var dbCmds = require('./dbCmds.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.weeklyReport = async (client) => {
	var now = Math.floor(new Date().getTime() / 1000.0);
	var nowMinus7 = now - 604800;
	var today = `<t:${now}:d>`;
	var lastweek = `<t:${nowMinus7}:d>`;

	var peopleArray = await dbCmds.weeklyCommissionRep();
	var commissionDescList = '';

	for (i = 0; i < peopleArray.length; i++) {
		if (peopleArray[i].weeklyCarsSold < 100) {
			var currentCommission = peopleArray[i].commission25Percent;
		} else {
			var currentCommission = peopleArray[i].commission30Percent;
		}

		commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}** (\`${peopleArray[i].bankAccount}\`): ${formatter.format(currentCommission)}\n`);

		await dbCmds.resetCommission(peopleArray[i].discordId);
	}

	if (commissionDescList == '') {
		commissionDescList = "There is no commission to pay this week."
	}

	var embed = new EmbedBuilder()
		.setTitle(`Weekly commission report for ${lastweek} through ${today}:`)
		.setDescription(commissionDescList)
		.setColor('EDC531');

	await client.channels.cache.get(process.env.COMMISSION_REPORT_CHANNEL_ID).send({ embeds: [embed] });

	// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
	var now = Math.floor(new Date().getTime() / 1000.0);
	var repDate = `<t:${now}:d>`
	var reason = `Automatic Commission Report Triggered on ${repDate}`
	var notificationEmbed = new EmbedBuilder()
		.setTitle('Commission Modified Automatically:')
		.setDescription(`All salesperson's commissions have been reset to \`$0\`.\n\n**Reason:** ${reason}.`)
		.setColor('#1EC276');
	await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
};