let moment = require('moment');
let dbCmds = require('../dbCmds.js');
const editEmbed = require('../editEmbed.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'updatename',
	description: 'Updates the name in the database for the specified user',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to update the character name for',
			type: 6,
			required: true,
		},
	],
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let user = interaction.options.getUser('user');
				let userId = user.id;
				let guild = await interaction.client.guilds.fetch(process.env.DISCORD_SERVER_ID);
				let guildUser = await guild.members.fetch(userId);
				let charName;

				if (guildUser.nickname) {
					charName = guildUser.nickname;
				} else {
					charName = guildUser.user.username;
				}

				await dbCmds.setCharName(userId, charName);

				await editEmbed.editStatsEmbed(interaction.client);
				await interaction.reply({ content: [`Successfully set the name for <@${userId}> to \`${charName}\`.`], ephemeral: true });
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

				if (errString === 'Error: The service is currently unavailable.') {
					try {
						await interaction.editReply({ content: `⚠ A service provider we use has had a temporary outage. Please try to submit your request again.`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `⚠ A service provider we use has had a temporary outage. Please try to submit your request again.`, ephemeral: true });
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
	},
};