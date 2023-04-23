var { PermissionsBitField } = require('discord.js');
var commissionCmds = require('../commissionCmds.js');

module.exports = {
	name: 'commissionreport',
	description: 'Manually runs the commission report for the Management team',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var result = commissionCmds.commissionReport(interaction.client);
			if (result == "success") {
				await interaction.reply({ content: `Successfully ran the commission report.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `:exclamation: The commission report has been run recently, please wait 24 hours between reports.`, ephemeral: true });
			}
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};