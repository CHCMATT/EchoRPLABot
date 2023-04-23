var { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		var buttonID = interaction.customId;
		switch (buttonID) {
			case 'addRegularCarSale':
				var addRegularCarSaleModal = new ModalBuilder()
					.setCustomId('addRegularCarSaleModal')
					.setTitle('Log a regular car that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the car to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Ashlynn Waves')
					.setRequired(true);
				var vehicleNameInput = new TextInputBuilder()
					.setCustomId('vehicleNameInput')
					.setLabel("What is the vehicle name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Sentinel Convertible')
					.setRequired(true);
				var vehiclePlateInput = new TextInputBuilder()
					.setCustomId('vehiclePlateInput')
					.setLabel("What was the car's license plate?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('040C0491')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('30000')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes to include about this sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('First purchase discount')
					.setRequired(false);

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var vehicleNameInputRow = new ActionRowBuilder().addComponents(vehicleNameInput);
				var vehiclePlateInputRow = new ActionRowBuilder().addComponents(vehiclePlateInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);

				addRegularCarSaleModal.addComponents(soldToInputRow, vehicleNameInputRow, vehiclePlateInputRow, priceInputRow, notesInputRow);

				await interaction.showModal(addRegularCarSaleModal);
				break;
			case 'addSportsCarSale':
				var addSportsCarSaleModal = new ModalBuilder()
					.setCustomId('addSportsCarSaleModal')
					.setTitle('Log a sports car that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the car to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Hennessey Stax')
					.setRequired(true);
				var vehicleNameInput = new TextInputBuilder()
					.setCustomId('vehicleNameInput')
					.setLabel("What is the vehicle name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Komoda')
					.setRequired(true);
				var vehiclePlateInput = new TextInputBuilder()
					.setCustomId('vehiclePlateInput')
					.setLabel("What was the car's license plate?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('J09IN4E7')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('105000')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes to include about this sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Multiple purchase discount')
					.setRequired(false);

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var vehicleNameInputRow = new ActionRowBuilder().addComponents(vehicleNameInput);
				var vehiclePlateInputRow = new ActionRowBuilder().addComponents(vehiclePlateInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);

				addSportsCarSaleModal.addComponents(soldToInputRow, vehicleNameInputRow, vehiclePlateInputRow, priceInputRow, notesInputRow);

				await interaction.showModal(addSportsCarSaleModal);
				break;
			case 'addTunerCarSale':
				var addTunerCarSaleModal = new ModalBuilder()
					.setCustomId('addTunerCarSaleModal')
					.setTitle('Log a tuner car that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the car to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Aria Kinsley')
					.setRequired(true);
				var vehicleNameInput = new TextInputBuilder()
					.setCustomId('vehicleNameInput')
					.setLabel("What is the vehicle name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Dominator ASP')
					.setRequired(true);
				var vehiclePlateInput = new TextInputBuilder()
					.setCustomId('vehiclePlateInput')
					.setLabel("What was the car's license plate?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('G4T1N409')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('145000')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes to include about this sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('5k discount')
					.setRequired(false);

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var vehicleNameInputRow = new ActionRowBuilder().addComponents(vehicleNameInput);
				var vehiclePlateInputRow = new ActionRowBuilder().addComponents(vehiclePlateInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);

				addTunerCarSaleModal.addComponents(soldToInputRow, vehicleNameInputRow, vehiclePlateInputRow, priceInputRow, notesInputRow);

				await interaction.showModal(addTunerCarSaleModal);
				break;
			case 'addEmployeeSale':
				var addEmployeeSaleModal = new ModalBuilder()
					.setCustomId('addEmployeeSaleModal')
					.setTitle('Log a car that you sold to a fellow employee');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the car to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Trevon Ricch')
					.setRequired(true);
				var vehicleNameInput = new TextInputBuilder()
					.setCustomId('vehicleNameInput')
					.setLabel("What is the vehicle name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('190z')
					.setRequired(true);
				var vehiclePlateInput = new TextInputBuilder()
					.setCustomId('vehiclePlateInput')
					.setLabel("What was the car's license plate?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('G904Z23M')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('75000')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes to include about this sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Self purchase')
					.setRequired(false);

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var vehicleNameInputRow = new ActionRowBuilder().addComponents(vehicleNameInput);
				var vehiclePlateInputRow = new ActionRowBuilder().addComponents(vehiclePlateInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);

				addEmployeeSaleModal.addComponents(soldToInputRow, vehicleNameInputRow, vehiclePlateInputRow, priceInputRow, notesInputRow);

				await interaction.showModal(addEmployeeSaleModal);
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	}
	catch (error) {
		console.log(`Error in button press!`);
		console.error(error);
	}
};