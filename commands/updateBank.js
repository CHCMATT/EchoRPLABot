var dbCmds = require('../dbCmds.js');
var { PermissionsBitField } = require('discord.js');

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
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.options.getUser('user');
			var bankNum = interaction.options.getString('accountnumber');
			await dbCmds.setBankAccount(user.id, bankNum)
			await interaction.reply({ content: `Successfully set the bank account number for <@${user.id}> to \`${bankNum}\`.`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};