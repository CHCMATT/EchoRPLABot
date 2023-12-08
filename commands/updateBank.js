let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'updatebank',
	description: 'Updates the bank account number for the specified user',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to update the bank account for on',
			type: 6,
			required: true,
		},
		{
			name: 'accountnumber',
			description: 'The bank account number you\'d like to update',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let user = interaction.options.getUser('user');
				let bankNum = interaction.options.getString('accountnumber').replaceAll(' ', '');
				await dbCmds.setBankAccount(user.id, bankNum)
				await interaction.reply({ content: `Successfully set the bank account number for <@${user.id}> to \`${bankNum}\`.`, ephemeral: true });
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

				console.log(`An error occured at ${errTime} at file ${fileName}!`);

				let errString = error.toString();

				if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.') {
					try {
						await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					}
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	}
};