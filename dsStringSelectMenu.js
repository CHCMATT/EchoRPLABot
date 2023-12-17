let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports.stringSelectMenuSubmit = async (interaction) => {
	try {
		let selectStringMenuID = interaction.customId;
		switch (selectStringMenuID) {
			case 'logSaleSelectOptions':
				if (interaction.values[0] == "logRegularCarSale") {
					let logRegularCarSaleModal = new ModalBuilder()
						.setCustomId('logRegularCarSaleModal')
						.setTitle('Log a regular car sale');
					let regSoldToInput = new TextInputBuilder()
						.setCustomId('regSoldToInput')
						.setLabel("Who did you sell the car to?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Ashlynn Waves')
						.setRequired(true);
					let regVehicleNameInput = new TextInputBuilder()
						.setCustomId('regVehicleNameInput')
						.setLabel("What is the vehicle name?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Sentinel Convertible')
						.setRequired(true);
					let regVehiclePlateInput = new TextInputBuilder()
						.setCustomId('regVehiclePlateInput')
						.setLabel("What was the car's license plate?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('040C0491')
						.setRequired(true);
					let regPriceInput = new TextInputBuilder()
						.setCustomId('regPriceInput')
						.setLabel("What was the final sale price?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('30000')
						.setRequired(true);
					let regNotesInput = new TextInputBuilder()
						.setCustomId('regNotesInput')
						.setLabel("Any notes to include about this sale?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('First purchase discount')
						.setRequired(false);

					let regSoldToInputRow = new ActionRowBuilder().addComponents(regSoldToInput);
					let regVehicleNameInputRow = new ActionRowBuilder().addComponents(regVehicleNameInput);
					let regVehiclePlateInputRow = new ActionRowBuilder().addComponents(regVehiclePlateInput);
					let regPriceInputRow = new ActionRowBuilder().addComponents(regPriceInput);
					let regNotesInputRow = new ActionRowBuilder().addComponents(regNotesInput);

					logRegularCarSaleModal.addComponents(regSoldToInputRow, regVehicleNameInputRow, regVehiclePlateInputRow, regPriceInputRow, regNotesInputRow);

					await interaction.showModal(logRegularCarSaleModal);
				} else if (interaction.values[0] == "logSportsCarSale") {
					let logSportsCarSaleModal = new ModalBuilder()
						.setCustomId('logSportsCarSaleModal')
						.setTitle('Log a sports car sale');
					let sportsSoldToInput = new TextInputBuilder()
						.setCustomId('sportsSoldToInput')
						.setLabel("Who did you sell the car to?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Hennessey Stax')
						.setRequired(true);
					let sportsVehicleNameInput = new TextInputBuilder()
						.setCustomId('sportsVehicleNameInput')
						.setLabel("What is the vehicle name?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Komoda')
						.setRequired(true);
					let sportsVehiclePlateInput = new TextInputBuilder()
						.setCustomId('sportsVehiclePlateInput')
						.setLabel("What was the car's license plate?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('J09IN4E7')
						.setRequired(true);
					let sportsPriceInput = new TextInputBuilder()
						.setCustomId('sportsPriceInput')
						.setLabel("What was the final sale price?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('105000')
						.setRequired(true);
					let sportsNotesInput = new TextInputBuilder()
						.setCustomId('sportsNotesInput')
						.setLabel("Any notes to include about this sale?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Multiple purchase discount')
						.setRequired(false);

					let sportsSoldToInputRow = new ActionRowBuilder().addComponents(sportsSoldToInput);
					let sportsVehicleNameInputRow = new ActionRowBuilder().addComponents(sportsVehicleNameInput);
					let sportsVehiclePlateInputRow = new ActionRowBuilder().addComponents(sportsVehiclePlateInput);
					let sportsPriceInputRow = new ActionRowBuilder().addComponents(sportsPriceInput);
					let sportsNotesInputRow = new ActionRowBuilder().addComponents(sportsNotesInput);

					logSportsCarSaleModal.addComponents(sportsSoldToInputRow, sportsVehicleNameInputRow, sportsVehiclePlateInputRow, sportsPriceInputRow, sportsNotesInputRow);

					await interaction.showModal(logSportsCarSaleModal);
				} else if (interaction.values[0] == "logTunerCarSale") {
					let logTunerCarSaleModal = new ModalBuilder()
						.setCustomId('logTunerCarSaleModal')
						.setTitle('Log a tuner car sale');
					let tunerSoldToInput = new TextInputBuilder()
						.setCustomId('tunerSoldToInput')
						.setLabel("Who did you sell the car to?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Aria Kinsley')
						.setRequired(true);
					let tunerVehicleNameInput = new TextInputBuilder()
						.setCustomId('tunerVehicleNameInput')
						.setLabel("What is the vehicle name?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Dominator ASP')
						.setRequired(true);
					let tunerVehiclePlateInput = new TextInputBuilder()
						.setCustomId('tunerVehiclePlateInput')
						.setLabel("What was the car's license plate?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('G4T1N409')
						.setRequired(true);
					let tunerPriceInput = new TextInputBuilder()
						.setCustomId('tunerPriceInput')
						.setLabel("What was the final sale price?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('145000')
						.setRequired(true);
					let tunerNotesInput = new TextInputBuilder()
						.setCustomId('tunerNotesInput')
						.setLabel("Any notes to include about this sale?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('5k discount')
						.setRequired(false);

					let tunerSoldToInputRow = new ActionRowBuilder().addComponents(tunerSoldToInput);
					let tunerVehicleNameInputRow = new ActionRowBuilder().addComponents(tunerVehicleNameInput);
					let tunerVehiclePlateInputRow = new ActionRowBuilder().addComponents(tunerVehiclePlateInput);
					let tunerPriceInputRow = new ActionRowBuilder().addComponents(tunerPriceInput);
					let tunerNotesInputRow = new ActionRowBuilder().addComponents(tunerNotesInput);

					logTunerCarSaleModal.addComponents(tunerSoldToInputRow, tunerVehicleNameInputRow, tunerVehiclePlateInputRow, tunerPriceInputRow, tunerNotesInputRow);

					await interaction.showModal(logTunerCarSaleModal);
				} else if (interaction.values[0] == "logEmployeeCarSale") {
					let logEmployeeCarSaleModal = new ModalBuilder()
						.setCustomId('logEmployeeCarSaleModal')
						.setTitle('Log a sale to a LA employee');
					let empSoldToInput = new TextInputBuilder()
						.setCustomId('empSoldToInput')
						.setLabel("Who did you sell the car to?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Trevon Ricch')
						.setRequired(true);
					let empVehicleNameInput = new TextInputBuilder()
						.setCustomId('empVehicleNameInput')
						.setLabel("What is the vehicle name?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('190z')
						.setRequired(true);
					let empVehiclePlateInput = new TextInputBuilder()
						.setCustomId('empVehiclePlateInput')
						.setLabel("What was the car's license plate?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('G904Z23M')
						.setRequired(true);
					let empPriceInput = new TextInputBuilder()
						.setCustomId('empPriceInput')
						.setLabel("What was the final sale price?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('75000')
						.setRequired(true);
					let empNotesInput = new TextInputBuilder()
						.setCustomId('empNotesInput')
						.setLabel("Any notes to include about this sale?")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Self purchase')
						.setRequired(false);

					let empSoldToInputRow = new ActionRowBuilder().addComponents(empSoldToInput);
					let empVehicleNameInputRow = new ActionRowBuilder().addComponents(empVehicleNameInput);
					let empVehiclePlateInputRow = new ActionRowBuilder().addComponents(empVehiclePlateInput);
					let empPriceInputRow = new ActionRowBuilder().addComponents(empPriceInput);
					let empNotesInputRow = new ActionRowBuilder().addComponents(empNotesInput);

					logEmployeeCarSaleModal.addComponents(empSoldToInputRow, empVehicleNameInputRow, empVehiclePlateInputRow, empPriceInputRow, empNotesInputRow);

					await interaction.showModal(logEmployeeCarSaleModal);
				}
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
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

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
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


