var { PermissionsBitField } = require('discord.js');
var commissionCmds = require('../commissionCmds.js');

module.exports = {
	name: 'commissionreport',
	description: 'Manually runs the commission report for the Management team',
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				var result = await commissionCmds.commissionReport(interaction.client, `Manual`, `<@${interaction.user.id}>`);
				if (result === "success") {
					await interaction.reply({ content: `Successfully ran the commission report.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:exclamation: The commission report has been run recently, please wait 24 hours between reports.`, ephemeral: true });
				}
			}
			else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
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

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

			console.log(`Error occured at ${errTime} at file ${fileName}!`);
			console.error(error);
		}
	}
};