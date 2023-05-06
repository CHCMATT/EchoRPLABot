var { PermissionsBitField } = require('discord.js');
var commissionCmds = require('../commissionCmds.js');

module.exports = {
	name: 'erasesale',
	description: 'Erases any sales with the specified license plate, as well as all relevant metrics',
	options: [
		{
			name: 'licenseplate',
			description: 'The license plate of the car sale that you\'d like to erase',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.SALESMAN_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.user;
			var plateInput = interaction.options.getString('licenseplate').toUpperCase();

			var channel = await interaction.client.channels.fetch(process.env.CAR_SALES_CHANNEL_ID)
			var messages = await channel.messages.fetch();

			messages.forEach(async (message) => {
				var lp = message.embeds[0].data.fields[4].value.toUpperCase();
				var fullName = message.embeds[0].data.fields[0].value;
				var fullNameSplit = fullName.split('@');
				var userId = fullNameSplit[1].substring(fullNameSplit[1], fullNameSplit[1].length - 2);
				var salePrice = message.embeds[0].data.fields[5].value.replaceAll('$', '').replaceAll(',', '');
				var commission25Percent = (salePrice - asdkasdnmkasd);

				var channelMsgs = { msgId: message.id, licensePlate: lp, user: userId, cost: cost }

				if (channelMsgs.licensePlate === plateInput) {
					var currMsgId = channelMsgs.msgId;
					var currLp = channelMsgs.licensePlate;
					var currUser = channelMsgs.user;
					var currCost = channelMsgs.cost;

					console.log(currMsgId, currLp, currUser, currCost);

					var msgToDelete = await channel.messages.fetch(currMsgId)
					await msgToDelete.delete();


				}
			});
		}
	}
};