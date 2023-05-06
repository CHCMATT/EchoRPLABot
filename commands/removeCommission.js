var dbCmds = require('../dbCmds.js');
var { PermissionsBitField, EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
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
			name: 'commissiontwentyfive',
			description: 'The amount of commission you\'d like to remove from the 25% counter',
			type: 4,
			required: true,
		},
		{
			name: 'commissionthirty',
			description: 'The amount of commission you\'d like to remove from the 30% counter',
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
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.options.getUser('user');
			if (interaction.user.id == user.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				var commission25Percent = Math.abs(interaction.options.getInteger('commissiontwentyfive'));
				var commission30Percent = Math.abs(interaction.options.getInteger('commissionthirty'));
				var reason = interaction.options.getString('reason');

				var formatted25Percent = formatter.format(commission25Percent);
				var formatted30Percent = formatter.format(commission30Percent);

				var personnelData = await dbCmds.readPersStats(user.id)
				if (personnelData.commission25Percent != null && personnelData.commission25Percent > 0) {
					await dbCmds.removeCommission(user.id, commission25Percent, commission30Percent)

					var personnelData = await dbCmds.readPersStats(user.id)
					var commissionArray = await dbCmds.readCommission(user.id);
					var weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

					if (weeklyCarsSold < 100) {
						var overallCommission = commissionArray.commission25Percent;
						var commissionPercent = "25%";
					} else {
						var overallCommission = commissionArray.commission30Percent;
						var commissionPercent = "30%";
					}

					var formattedOverallCommission = formatter.format(overallCommission);

					// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> removed from <@${user.id}>'s commission:\n• **25%:** \`${formatted25Percent}\`\n• **30%:** \`${formatted30Percent}\`\n\nTheir new total is (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.\n\n**Reason:** \`${reason}\`.`)

						.setColor('#FFA630');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
					await interaction.reply({ content: `Successfully removed \`${formatted25Percent}\` from <@${user.id}>'s 25% commission and \`${formatted30Percent}\` from their 30% commission for a new total of (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:exclamation: <@${user.id}> doesn't have any commission to modify, yet.`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} else {
			await interaction.reply({ content: `:x: You must have the \`Salesman\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};