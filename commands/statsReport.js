let moment = require('moment');
let statsReport = require('../statsReport.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'statsreport',
	description: 'Manually runs the statistics report for the Management team',
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let result = await statsReport.statsReport(interaction.client, `Manual`, `<@${interaction.user.id}>`);
				if (result === "success") {
					await interaction.reply({ content: `Successfully ran the statistics report.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:exclamation: The commission report has been run recently, please wait 24 hours between reports.`, ephemeral: true });
				}
			}
			else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				console.error(error);
			} else {
				console.error(error);

				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.log(`Error occured at ${errTime} at file ${fileName}!`);

				let errString = error.toString();

				let gServUnavailIndc;

				if (errString === 'Error: The service is currently unavailable.') {
					gServUnavailIndc = '\`gServUnavailIndc: true\`';
				} else {
					gServUnavailIndc = '\`gServUnavailIndc: false\`';
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ content: gServUnavailIndc, embeds: errorEmbed });
			}
		}
	}
};