var startup = require('../startup.js');
var { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'startup',
	description: 'Posts the embed to the specified channel',
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				const postOrEdit = await startup.startUp(interaction.client);
				await interaction.reply({ content: `Successfully ${postOrEdit} the embed to the <#${process.env.EMBED_CHANNEL_ID}> channel.`, ephemeral: true });
			}
			else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
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
	}
};