let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		let buttonID = interaction.customId;
		switch (buttonID) {
			case 'addRegularCarSale':
				let addRegularCarSaleModal = new ModalBuilder()
					.setCustomId('addRegularCarSaleModal')
					.setTitle('Log a regular car that you sold');
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

				addRegularCarSaleModal.addComponents(regSoldToInputRow, regVehicleNameInputRow, regVehiclePlateInputRow, regPriceInputRow, regNotesInputRow);

				await interaction.showModal(addRegularCarSaleModal);
				break;
			case 'addSportsCarSale':
				let addSportsCarSaleModal = new ModalBuilder()
					.setCustomId('addSportsCarSaleModal')
					.setTitle('Log a sports car that you sold');
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

				addSportsCarSaleModal.addComponents(sportsSoldToInputRow, sportsVehicleNameInputRow, sportsVehiclePlateInputRow, sportsPriceInputRow, sportsNotesInputRow);

				await interaction.showModal(addSportsCarSaleModal);
				break;
			case 'addTunerCarSale':
				let addTunerCarSaleModal = new ModalBuilder()
					.setCustomId('addTunerCarSaleModal')
					.setTitle('Log a tuner car that you sold');
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

				addTunerCarSaleModal.addComponents(tunerSoldToInputRow, tunerVehicleNameInputRow, tunerVehiclePlateInputRow, tunerPriceInputRow, tunerNotesInputRow);

				await interaction.showModal(addTunerCarSaleModal);
				break;
			case 'addEmployeeSale':
				let addEmployeeSaleModal = new ModalBuilder()
					.setCustomId('addEmployeeSaleModal')
					.setTitle('Log a car that you sold to a fellow employee');
				let employeeSoldToInput = new TextInputBuilder()
					.setCustomId('employeeSoldToInput')
					.setLabel("Who did you sell the car to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Trevon Ricch')
					.setRequired(true);
				let employeeVehicleNameInput = new TextInputBuilder()
					.setCustomId('employeeVehicleNameInput')
					.setLabel("What is the vehicle name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('190z')
					.setRequired(true);
				let employeeVehiclePlateInput = new TextInputBuilder()
					.setCustomId('employeeVehiclePlateInput')
					.setLabel("What was the car's license plate?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('G904Z23M')
					.setRequired(true);
				let employeePriceInput = new TextInputBuilder()
					.setCustomId('employeePriceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('75000')
					.setRequired(true);
				let employeeNotesInput = new TextInputBuilder()
					.setCustomId('employeeNotesInput')
					.setLabel("Any notes to include about this sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Self purchase')
					.setRequired(false);

				let employeeSoldToInputRow = new ActionRowBuilder().addComponents(employeeSoldToInput);
				let employeeVehicleNameInputRow = new ActionRowBuilder().addComponents(employeeVehicleNameInput);
				let employeeVehiclePlateInputRow = new ActionRowBuilder().addComponents(employeeVehiclePlateInput);
				let employeePriceInputRow = new ActionRowBuilder().addComponents(employeePriceInput);
				let employeeNotesInputRow = new ActionRowBuilder().addComponents(employeeNotesInput);

				addEmployeeSaleModal.addComponents(employeeSoldToInputRow, employeeVehicleNameInputRow, employeeVehiclePlateInputRow, employeePriceInputRow, employeeNotesInputRow);

				await interaction.showModal(addEmployeeSaleModal);
				break;
			case 'addCarRental':
				let addCarRentalModal = new ModalBuilder()
					.setCustomId('addCarRentalModal')
					.setTitle('Log a car that you rented');
				let rentalRentedToInput = new TextInputBuilder()
					.setCustomId('rentalRentedToInput')
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

				let rentalRentedToInputRow = new ActionRowBuilder().addComponents(rentalRentedToInput);
				let rentalVehicleNameInputRow = new ActionRowBuilder().addComponents(rentalVehicleNameInput);
				let rentalVehiclePlateInputRow = new ActionRowBuilder().addComponents(rentalVehiclePlateInput);
				let rentalPriceInputRow = new ActionRowBuilder().addComponents(rentalPriceInput);
				let rentalNotesInputRow = new ActionRowBuilder().addComponents(rentalNotesInput);

				addCarRentalModal.addComponents(rentalRentedToInputRow, rentalVehicleNameInputRow, rentalVehiclePlateInputRow, rentalPriceInputRow, rentalNotesInputRow);

				await interaction.showModal(addCarRentalModal);
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	} catch (error) {
		let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		let fileParts = __filename.split(/[\\/]/);
		let fileName = fileParts[fileParts.length - 1];

		let errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};