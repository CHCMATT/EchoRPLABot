var dbCmds = require('../dbCmds.js');
var { PermissionsBitField } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'erasesale',
	description: 'Erases a sale and all relevant metrics',
	options: [
		{
			name: 'licenseplate',
			description: 'The license plate of the car sale that you\'d like to erase',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.user;
			var plateInput = interaction.options.getString('licenseplate').toUpperCase();

			var channel = await interaction.client.channels.fetch(process.env.CAR_SALES_CHANNEL_ID)
			var messages = await channel.messages.fetch();

			messages.forEach(async (message) => {
				const lp = message.embeds[0].data.fields[4].value.toUpperCase();
				const user = message.embeds[0].data.fields[0].value;
				const cost = message.embeds[0].data.fields[5].value;

				var channelMsgs = { msgId: message.id, licensePlate: lp, user: user, cost: cost }
				//console.log(message.embeds[0].data.fields);
				//console.log(channelMsgs);

				if (channelMsgs.licensePlate === plateInput) {
					var msgToDelete = await channel.messages.fetch(channelMsgs.msgId)
					await msgToDelete.delete();
					console.log(`deleted ${channelMsgs.msgId}`);
				}
				//old: 1098844125484302438, new: 1099555011995893900
			});
		}
	}
};
