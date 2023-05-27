let { PermissionsBitField } = require('discord.js');
let commissionCmds = require('../commissionCmds.js');

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
			let plateInput = interaction.options.getString('licenseplate').toUpperCase();

			let channel = await interaction.client.channels.fetch(process.env.CAR_SALES_CHANNEL_ID)
			let messages = await channel.messages.fetch();

			messages.forEach(async (message) => {
				let lp = message.embeds[0].data.fields[4].value.toUpperCase();
				let fullName = message.embeds[0].data.fields[0].value;
				let fullNameSplit = fullName.split('@');
				let userId = fullNameSplit[1].substring(fullNameSplit[1], fullNameSplit[1].length - 2);
				let salePrice = message.embeds[0].data.fields[5].value.replaceAll('$', '').replaceAll(',', '');

				let channelMsgs = { msgId: message.id, licensePlate: lp, user: userId, cost: cost }

				if (channelMsgs.licensePlate === plateInput) {
					let currMsgId = channelMsgs.msgId;
					let currLp = channelMsgs.licensePlate;
					let currUser = channelMsgs.user;
					let currCost = channelMsgs.cost;

					console.log(currMsgId, currLp, currUser, currCost);

					let msgToDelete = await channel.messages.fetch(currMsgId)
					await msgToDelete.delete();

				}
			});
		}
	}
};