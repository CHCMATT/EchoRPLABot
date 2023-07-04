let dbCmds = require('../dbCmds.js');
let { PermissionsBitField } = require('discord.js');
const editEmbed = require('../editEmbed.js');

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

			await editEmbed.editEmbed(interaction.client);
			await interaction.reply({ content: `Successfully set the name for <@${userId}> to \`${charName}\`.`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};