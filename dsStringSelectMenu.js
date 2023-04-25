var { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');

module.exports.stringSelectMenuSubmit = async (interaction) => {
	try {
		var selectStringMenuID = interaction.customId;
		switch (selectStringMenuID) {
			case 'starter':
				var select2 = new StringSelectMenuBuilder()
					.setCustomId('starter2')
					.setPlaceholder('Make a 2nd selection!')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Label 1')
							.setDescription('Description 1')
							.setValue('Value 1'),
					);
				var row2 = new ActionRowBuilder()
					.addComponents(select2);

				await interaction.reply({
					content: 'Pick a 2nd number...',
					components: [row2],
					ephemeral: true
				});
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


