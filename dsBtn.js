let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		let buttonID = interaction.customId;
		switch (buttonID) {
			case 'logCarRental':
				let logCarRentalModal = new ModalBuilder()
					.setCustomId('logCarRentalModal')
					.setTitle('Log a car that you rented');
				let rentedToInput = new TextInputBuilder()
					.setCustomId('rentedToInput')
					.setLabel("Who did you rent the car to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Stacy Cox')
					.setRequired(true);
				let rentalVehicleNameInput = new TextInputBuilder()
					.setCustomId('rentalVehicleNameInput')
					.setLabel("What is the vehicle name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Caracara 4x4')
					.setRequired(true);
				let rentalVehiclePlateInput = new TextInputBuilder()
					.setCustomId('rentalVehiclePlateInput')
					.setLabel("What was the car's license plate?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('54CB17D6')
					.setRequired(true);
				let rentalPriceInput = new TextInputBuilder()
					.setCustomId('rentalPriceInput')
					.setLabel("What was the rental price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('1000')
					.setRequired(true);
				let rentalNotesInput = new TextInputBuilder()
					.setCustomId('rentalNotesInput')
					.setLabel("Any notes to include about this rental?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('First time rental')
					.setRequired(false);

				let rentedToInputRow = new ActionRowBuilder().addComponents(rentedToInput);
				let rentalVehicleNameInputRow = new ActionRowBuilder().addComponents(rentalVehicleNameInput);
				let rentalVehiclePlateInputRow = new ActionRowBuilder().addComponents(rentalVehiclePlateInput);
				let rentalPriceInputRow = new ActionRowBuilder().addComponents(rentalPriceInput);
				let rentalNotesInputRow = new ActionRowBuilder().addComponents(rentalNotesInput);

				logCarRentalModal.addComponents(rentedToInputRow, rentalVehicleNameInputRow, rentalVehiclePlateInputRow, rentalPriceInputRow, rentalNotesInputRow);

				await interaction.showModal(logCarRentalModal);
				break;
			case 'addYPAdvert':
				let addYPAdvertModal = new ModalBuilder()
					.setCustomId('addYPAdvertModal')
					.setTitle('Log a Yellow Pages advertisement');
				let screenshotInput = new TextInputBuilder()
					.setCustomId('screenshotInput')
					.setLabel('What is the link to a screenshot of the ad?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/gLa2XGJ.jpeg')
					.setRequired(true);
				let screenshotInputRow = new ActionRowBuilder().addComponents(screenshotInput);
				addYPAdvertModal.addComponents(screenshotInputRow);
				await interaction.showModal(addYPAdvertModal);
				break;
			case 'logSaleDropdown':
				await interaction.deferReply({ ephemeral: true });

				let logSaleSelectOptions = new StringSelectMenuBuilder()
					.setCustomId('logSaleSelectOptions')
					.setPlaceholder('Select a car sale type')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Regular Car Sale')
							.setEmoji('🚗')
							.setValue('logRegularCarSale'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Sports Car Sale')
							.setEmoji('🚙')
							.setValue('logSportsCarSale'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Tuner Car Sale')
							.setEmoji('🏎')
							.setValue('logTunerCarSale'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Employee Car Sale')
							.setEmoji('👨‍💼')
							.setValue('logEmployeeCarSale'),
					);

				let logSaleSelectComponent = new ActionRowBuilder()
					.addComponents(logSaleSelectOptions);

				await interaction.editReply({ content: `What type of car sale is this?`, components: [logSaleSelectComponent], ephemeral: true });
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
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

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.') {
				try {
					await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				} catch {
					await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
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
};