var { PermissionsBitField } = require('discord.js');
var statsReport = require('../statsReport.js');

module.exports = {
	name: 'statsreport',
	description: 'Manually runs the statistics report for the Management team',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var result = await statsReport.statsReport(interaction.client, `Manual`, `<@${interaction.user.id}>`);
			if (result === "success") {
				await interaction.reply({ content: `Successfully ran the statistics report.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `:exclamation: The commission report has been run recently, please wait 24 hours between reports.`, ephemeral: true });
			}
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};