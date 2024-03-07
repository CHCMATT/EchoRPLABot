let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let editEmbed = require('../editEmbed.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'removecommission',
	description: 'Removes the specified amount from the specified user\'s current commission metrics',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to modify commission on',
			type: 6,
			required: true,
		},
		{
			name: 'commission',
			description: 'The amount of commission you\'d like to remove from the specified salesperson',
			type: 4,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason for modifying the commission',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		try {
			if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let user = interaction.options.getUser('user');
				if (interaction.user.id == user.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let commission = Math.abs(interaction.options.getInteger('commission'));
					let reason = interaction.options.getString('reason');

					let formattedCommission = formatter.format(commission);

					let personnelData = await dbCmds.readPersStats(user.id)
					if (personnelData.currentCommission != null && personnelData.currentCommission > 0) {
						await dbCmds.removeCommission(user.id, commission)

						personnelData = await dbCmds.readPersStats(user.id)
						let overallCurrentCommission = await dbCmds.readCommission(user.id);
						let formattedOverallCurrentCommission = formatter.format(overallCurrentCommission);

						await editEmbed.editMgmtStatsEmbed(interaction.client);

						// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
						let notificationEmbed = new EmbedBuilder()
							.setTitle('Commission Modified Manually:')
							.setDescription(`<@${interaction.user.id}> removed \`${formattedCommission}\` from <@${user.id}>'s current commission for a new total of \`${formattedOverallCurrentCommission}\`.\n\n**Reason:** ${reason}.`)
							.setColor('#FFA630');

						await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

						await interaction.reply({ content: `Successfully removed \`${formattedCommission}\` from <@${user.id}>'s current commission for a new total of \`${formattedOverallCurrentCommission}\``, ephemeral: true });
					} else {
						await interaction.reply({ content: `:exclamation: <@${user.id}> doesn't have any commission to modify, yet.`, ephemeral: true });
					}
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `:x: You must have the \`Sales\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
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
	}
};