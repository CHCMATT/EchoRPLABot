let { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: 'selectmenu',
	description: 'Tests the select menu function in Discord.js',
	options: [
	],
	async execute(interaction) {

		let select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Label 1')
					.setDescription('Description 1')
					.setValue('Value 1'),
			);

		let row = new ActionRowBuilder()
			.addComponents(select);

		await interaction.reply({
			content: 'Pick a number...',
			components: [row],
			ephemeral: true
		});
	},
};