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
		try {
			if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let user = interaction.options.getUser('user');
				if (interaction.user.id == user.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let commission25Percent = Math.abs(interaction.options.getInteger('commissiontwentyfive'));
					let commission30Percent = Math.abs(interaction.options.getInteger('commissionthirty'));
					let reason = interaction.options.getString('reason');

					let formatted25Percent = formatter.format(commission25Percent);
					let formatted30Percent = formatter.format(commission30Percent);

					let personnelData = await dbCmds.readPersStats(user.id)
					if (personnelData.commission25Percent != null && personnelData.commission25Percent > 0) {
						await dbCmds.removeCommission(user.id, commission25Percent, commission30Percent)

						let personnelData = await dbCmds.readPersStats(user.id)
						let commissionArray = await dbCmds.readCommission(user.id);
						let weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

						if (weeklyCarsSold < 100) {
							let overallCommission = commissionArray.commission25Percent;
							let commissionPercent = "25%";
						} else {
							let overallCommission = commissionArray.commission30Percent;
							let commissionPercent = "30%";
						}

						let formattedOverallCommission = formatter.format(overallCommission);

						await editEmbed.editStatsEmbed(interaction.client);

						// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
						let notificationEmbed = new EmbedBuilder()
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
				await interaction.reply({ content: `:x: You must have the \`Sales\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
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

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

			console.log(`Error occured at ${errTime} at file ${fileName}!`);
			console.error(error);
		}
	}
};