var dsBtn = require('./dsBtn.js');
var dsModal = require('./dsModal.js');
var dsStringSelectMenu = require('./dsStringSelectMenu.js');

module.exports = (client) => {
	client.on('interactionCreate', async interaction => {
		try {
			if (interaction.isCommand()) {
				await client.commands[interaction.commandName].execute(interaction);
			}
			else if (interaction.isButton()) {
				await dsBtn.btnPressed(interaction);
			}
			else if (interaction.isModalSubmit()) {
				await dsModal.modalSubmit(interaction);
			}
			else if (interaction.isStringSelectMenu()) {
				await dsStringSelectMenu.stringSelectMenuSubmit(interaction);
			}
			else {
				await interaction.reply({ content: `I'm not familiar with this interaction. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized interaction '${interaction.customId}' with type '${interaction.constructor.name}'`);
				return;
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
	});
};