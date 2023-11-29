let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');
let personnelCmds = require('./personnelCmds.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function toTitleCase(str) {
	str = str.toLowerCase().split(' ');
	for (let i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}

function strCleanup(str) {
	let cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

function isValidUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

module.exports.modalSubmit = async (interaction) => {
	try {
		await interaction.deferReply({ ephemeral: true });

		let modalID = interaction.customId;
		switch (modalID) {
			case 'addRegularCarSaleModal':
				let regSalesmanName;
				if (interaction.member.nickname) {
					regSalesmanName = interaction.member.nickname;
				} else {
					regSalesmanName = interaction.member.user.username;
				}

				let regNow = Math.floor(new Date().getTime() / 1000.0);
				let regSaleDate = `<t:${regNow}:d>`;

				let regSoldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('regSoldToInput')));
				let regVehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('regVehicleNameInput')));
				let regVehiclePlate = strCleanup(interaction.fields.getTextInputValue('regVehiclePlateInput')).toUpperCase();
				let regPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('regPriceInput')).replaceAll(',', '').replaceAll('$', '')));
				let regNotes = strCleanup(interaction.fields.getTextInputValue('regNotesInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Car Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Regular`, `${regSalesmanName} (<@${interaction.user.id}>)`, regSaleDate, regSoldTo, regVehicleName, regVehiclePlate, regPrice, regNotes]] }
				});

				let regFormattedPrice = formatter.format(regPrice);

				if (isNaN(regPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('regPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let regCostPrice = (regPrice * 0.90);
				let regLaProfit = regPrice - regCostPrice;
				let regThisSaleCommission = (regLaProfit * 0.25);

				let regFormattedCostPrice = formatter.format(regCostPrice);
				let regFormattedLaProfit = formatter.format(regLaProfit);

				let regCarSoldEmbed;

				if (!regNotes || regNotes.toLowerCase() === "n/a") {
					regCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${regSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${regSaleDate}` },
							{ name: `Car Sold To:`, value: `${regSoldTo}` },
							{ name: `Vehicle Name:`, value: `${regVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${regVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${regFormattedPrice}` },
						)
						.setColor('03045E');
				} else {
					regCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${regSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${regSaleDate}` },
							{ name: `Car Sold To:`, value: `${regSoldTo}` },
							{ name: `Vehicle Name:`, value: `${regVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${regVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${regFormattedPrice}` },
							{ name: `Notes:`, value: `${regNotes}` }
						)
						.setColor('03045E');
				}

				let regPersonnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (regPersonnelStats == null || regPersonnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: [regCarSoldEmbed] });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "weeklyCarsSold");
				if (Math.round(regThisSaleCommission) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, regThisSaleCommission);
				}
				let regCurrentCommission = await dbCmds.readCommission(interaction.member.user.id);

				let regFormattedThisSaleCommission = formatter.format(regThisSaleCommission);
				let regFormattedCurrentCommission = formatter.format(regCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let regNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				if (Math.round(regThisSaleCommission) > 0) {
					let regReason = `Car Sale to \`${regSoldTo}\` costing \`${regFormattedPrice}\` on ${regSaleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let regNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${regFormattedThisSaleCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${regFormattedCurrentCommission}\`.\n\n**Reason:** ${regReason}.`)
						.setColor('#1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [regNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${regNewCarsSoldTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${regFormattedPrice}\`\n> Cost Price: \`${regFormattedCostPrice}\`\n> Luxury Autos Profit: \`${regFormattedLaProfit}\`\n> Your Commission: \`${regFormattedThisSaleCommission}\`\n\nYour weekly commission is now: \`${regFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addSportsCarSaleModal':
				let sportsSalesmanName;
				if (interaction.member.nickname) {
					sportsSalesmanName = interaction.member.nickname;
				} else {
					sportsSalesmanName = interaction.member.user.username;
				}

				let sportsNow = Math.floor(new Date().getTime() / 1000.0);
				let sportsSaleDate = `<t:${sportsNow}:d>`;

				let sportsSoldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('sportsSoldToInput')));
				let sportsVehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('sportsVehicleNameInput')));
				let sportsVehiclePlate = strCleanup(interaction.fields.getTextInputValue('sportsVehiclePlateInput')).toUpperCase();
				let sportsPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('sportsPriceInput')).replaceAll(',', '').replaceAll('$', '')));
				let sportsNotes = strCleanup(interaction.fields.getTextInputValue('sportsNotesInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Car Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Sports`, `${sportsSalesmanName} (<@${interaction.user.id}>)`, sportsSaleDate, sportsSoldTo, sportsVehicleName, sportsVehiclePlate, sportsPrice, sportsNotes]] }
				});


				if (isNaN(sportsPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('sportsPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let sportsFormattedPrice = formatter.format(sportsPrice);
				let sportsCostPrice = (sportsPrice * 0.85);
				let sportsLaProfit = sportsPrice - sportsCostPrice;
				let sportsThisSaleCommission = (sportsLaProfit * 0.25);
				let sportsFormattedCostPrice = formatter.format(sportsCostPrice);
				let sportsFormattedLaProfit = formatter.format(sportsLaProfit);
				let sportsCarSoldEmbed;

				if (!sportsNotes || sportsNotes.toLowerCase() === "n/a") {
					sportsCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new sports car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${sportsSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${sportsSaleDate}` },
							{ name: `Car Sold To:`, value: `${sportsSoldTo}` },
							{ name: `Vehicle Name:`, value: `${sportsVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${sportsVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${sportsFormattedPrice}` },
						)
						.setColor('023E8A');
				} else {
					sportsCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new sports car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${sportsSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${sportsSaleDate}` },
							{ name: `Car Sold To:`, value: `${sportsSoldTo}` },
							{ name: `Vehicle Name:`, value: `${sportsVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${sportsVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${sportsFormattedPrice}` },
							{ name: `Notes:`, value: `${sportsNotes}` }
						)
						.setColor('023E8A');
				}

				let sportsPersonnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (sportsPersonnelStats == null || sportsPersonnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: [sportsCarSoldEmbed] });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "weeklyCarsSold");
				if (Math.round(sportsThisSaleCommission) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, sportsThisSaleCommission);
				}
				let sportsCurrentCommission = await dbCmds.readCommission(interaction.member.user.id);

				let sportsFormattedThisSaleCommission = formatter.format(sportsThisSaleCommission);
				let sportsFormattedCurrentCommission = formatter.format(sportsCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let sportsNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				if (Math.round(sportsThisSaleCommission) > 0) {
					let sportsReason = `Sports Car Sale to \`${sportsSoldTo}\` costing \`${sportsFormattedPrice}\` on ${sportsSaleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let sportsNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${sportsFormattedThisSaleCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${sportsFormattedCurrentCommission}\`.\n\n**Reason:** ${sportsReason}.`)
						.setColor('#1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [sportsNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${sportsNewCarsSoldTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${sportsFormattedPrice}\`\n> Cost Price: \`${sportsFormattedCostPrice}\`\n> Luxury Autos Profit: \`${sportsFormattedLaProfit}\`\n> Your Commission: \`${sportsFormattedThisSaleCommission}\`\n\nYour weekly commission is now: \`${sportsFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addTunerCarSaleModal':
				let tunerSalesmanName;
				if (interaction.member.nickname) {
					tunerSalesmanName = interaction.member.nickname;
				} else {
					tunerSalesmanName = interaction.member.user.username;
				}

				let tunerNow = Math.floor(new Date().getTime() / 1000.0);
				let tunerSaleDate = `<t:${tunerNow}:d>`;

				let tunerSoldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('tunerSoldToInput')));
				let tunerVehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('tunerVehicleNameInput')));
				let tunerVehiclePlate = strCleanup(interaction.fields.getTextInputValue('tunerVehiclePlateInput')).toUpperCase();
				let tunerPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('tunerPriceInput')).replaceAll(',', '').replaceAll('$', '')));
				let tunerNotes = strCleanup(interaction.fields.getTextInputValue('tunerNotesInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Car Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Tuner`, `${tunerSalesmanName} (<@${interaction.user.id}>)`, tunerSaleDate, tunerSoldTo, tunerVehicleName, tunerVehiclePlate, tunerPrice, tunerNotes]] }
				});

				if (isNaN(tunerPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('tunerPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let tunerFormattedPrice = formatter.format(tunerPrice);
				let tunerCostPrice = (tunerPrice * 0.80);
				let tunerLaProfit = tunerPrice - tunerCostPrice;
				let tunerThisSaleCommission = (tunerLaProfit * 0.25);
				let tunerFormattedCostPrice = formatter.format(tunerCostPrice);
				let tunerFormattedLaProfit = formatter.format(tunerLaProfit);
				let tunerCarSoldEmbed;

				if (!tunerNotes || tunerNotes.toLowerCase() === "n/a") {
					tunerCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new tuner car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${tunerSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${tunerSaleDate}` },
							{ name: `Car Sold To:`, value: `${tunerSoldTo}` },
							{ name: `Vehicle Name:`, value: `${tunerVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${tunerVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${tunerFormattedPrice}` },
						)
						.setColor('0077B6');
				} else {
					tunerCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new tuner car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${tunerSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${tunerSaleDate}` },
							{ name: `Car Sold To:`, value: `${tunerSoldTo}` },
							{ name: `Vehicle Name:`, value: `${tunerVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${tunerVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${tunerFormattedPrice}` },
							{ name: `Notes:`, value: `${tunerNotes}` }
						)
						.setColor('0077B6');
				}

				let tunerPersonnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (tunerPersonnelStats == null || tunerPersonnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: [tunerCarSoldEmbed] });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "weeklyCarsSold");
				if (Math.round(tunerThisSaleCommission) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, tunerThisSaleCommission);
				}

				let tunerCurrentCommission = await dbCmds.readCommission(interaction.member.user.id);

				let tunerFormattedThisSaleCommission = formatter.format(tunerThisSaleCommission);
				let tunerFormattedCurrentCommission = formatter.format(tunerCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let tunerNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				if (Math.round(tunerThisSaleCommission) > 0) {
					let tunerReason = `Tuner Car Sale to \`${tunerSoldTo}\` costing \`${tunerFormattedPrice}\` on ${tunerSaleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let tunerNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${tunerFormattedThisSaleCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${tunerFormattedCurrentCommission}\`.\n\n**Reason:** ${tunerReason}.`)
						.setColor('#1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [tunerNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${tunerNewCarsSoldTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${tunerFormattedPrice}\`\n> Cost Price: \`${tunerFormattedCostPrice}\`\n> Luxury Autos Profit: \`${tunerFormattedLaProfit}\`\n> Your Commission: \`${tunerFormattedThisSaleCommission}\`\n\nYour weekly commission is now: \`${tunerFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addEmployeeSaleModal':
				let empSalesmanName;
				if (interaction.member.nickname) {
					empSalesmanName = interaction.member.nickname;
				} else {
					empSalesmanName = interaction.member.user.username;
				}

				let empNow = Math.floor(new Date().getTime() / 1000.0);
				let empSaleDate = `<t:${empNow}:d>`;

				let empSoldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('empSoldToInput')));
				let empVehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('empVehicleNameInput')));
				let empVehiclePlate = strCleanup(interaction.fields.getTextInputValue('empVehiclePlateInput')).toUpperCase();
				let empPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('empPriceInput')).replaceAll(',', '').replaceAll('$', '')));
				let empNotes = strCleanup(interaction.fields.getTextInputValue('empNotesInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Car Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Employee`, `${empSalesmanName} (<@${interaction.user.id}>)`, empSaleDate, empSoldTo, empVehicleName, empVehiclePlate, empPrice, empNotes]] }
				});

				if (isNaN(empPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('empPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let empFormattedPrice = formatter.format(empPrice);
				let empCostPrice = (empPrice * 0.80);
				let empLaProfit = empPrice - empCostPrice;
				let empFormattedCostPrice = formatter.format(empCostPrice);
				let empFormattedLaProfit = formatter.format(empLaProfit);
				let empCarSoldEmbed;

				if (!empNotes || empNotes.toLowerCase() === "n/a") {
					empCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new car has been sold to an employee!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${empSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${empSaleDate}` },
							{ name: `Car Sold To:`, value: `${empSoldTo}` },
							{ name: `Vehicle Name:`, value: `${empVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${empVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${empFormattedPrice}` },
						)
						.setColor('0096C7');
				} else {
					empCarSoldEmbed = new EmbedBuilder()
						.setTitle('A new car has been sold to an employee!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${empSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${empSaleDate}` },
							{ name: `Car Sold To:`, value: `${empSoldTo}` },
							{ name: `Vehicle Name:`, value: `${empVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${empVehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${empFormattedPrice}` },
							{ name: `Notes:`, value: `${empNotes}` }
						)
						.setColor('0096C7');
				}

				let empPersonnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (empPersonnelStats == null || empPersonnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: [empCarSoldEmbed] });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "weeklyCarsSold");
				let empCurrentCommission = await dbCmds.readCommission(interaction.member.user.id);

				let empFormattedCurrentCommission = formatter.format(empCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let empNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${empNewCarsSoldTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${empFormattedPrice}\`\n> Cost Price: \`${empFormattedCostPrice}\`\n> Luxury Autos Profit: \`${empFormattedLaProfit}\`\n> Your Commission: \`n/a\`\n\nYour weekly commission is now: \`${empFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addCarRentalModal':
				let rentalSalesmanName;
				if (interaction.member.nickname) {
					rentalSalesmanName = interaction.member.nickname;
				} else {
					rentalSalesmanName = interaction.member.user.username;
				}

				let rentalNow = Math.floor(new Date().getTime() / 1000.0);
				let rentalDate = `<t:${rentalNow}:d>`;

				let rentedTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('rentedToInput')));
				let rentalVehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('rentalVehicleNameInput')));
				let rentalVehiclePlate = strCleanup(interaction.fields.getTextInputValue('rentalVehiclePlateInput')).toUpperCase();
				let rentalPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('rentalPriceInput')).replaceAll(',', '').replaceAll('$', '')));
				let rentalNotes = strCleanup(interaction.fields.getTextInputValue('rentalNotesInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Car Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Rental`, `${rentalSalesmanName} (<@${interaction.user.id}>)`, rentalDate, rentedTo, rentalVehicleName, rentalVehiclePlate, rentalPrice, rentalNotes]] }
				});

				if (isNaN(rentalPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('rentalPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let rentalFormattedPrice = formatter.format(rentalPrice);
				let rentalThisSaleCommission = (rentalPrice * 0.50);
				let rentalCarRentedEmbed;

				if (!rentalNotes || rentalNotes.toLowerCase() === "n/a") {
					rentalCarRentedEmbed = new EmbedBuilder()
						.setTitle('A new car has been rented!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${rentalSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Rental Date:`, value: `${rentalDate}` },
							{ name: `Car Rented To:`, value: `${rentedTo}` },
							{ name: `Vehicle Name:`, value: `${rentalVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${rentalVehiclePlate}` },
							{ name: `Rental Price:`, value: `${rentalFormattedPrice}` },
						)
						.setColor('00B4D8');
				} else {
					rentalCarRentedEmbed = new EmbedBuilder()
						.setTitle('A new car has been rented!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${rentalSalesmanName} (<@${interaction.user.id}>)` },
							{ name: `Rental Date:`, value: `${rentalDate}` },
							{ name: `Car Rented To:`, value: `${rentedTo}` },
							{ name: `Vehicle Name:`, value: `${rentalVehicleName}` },
							{ name: `Vehicle Plate:`, value: `${rentalVehiclePlate}` },
							{ name: `Rental Price:`, value: `${rentalFormattedPrice}` },
							{ name: `Notes:`, value: `${rentalNotes}` }
						)
						.setColor('00B4D8');
				}

				let rentalPersonnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (rentalPersonnelStats == null || rentalPersonnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: [rentalCarRentedEmbed] });

				if (Math.round(rentalThisSaleCommission) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, rentalThisSaleCommission);
				}
				let rentalCurrentCommission = await dbCmds.readCommission(interaction.member.user.id);

				let rentalFormattedThisSaleCommission = formatter.format(rentalThisSaleCommission);
				let rentalFormattedCurrentCommission = formatter.format(rentalCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);

				if (Math.round(rentalThisSaleCommission) > 0) {
					let rentalReason = `Car Rental to \`${rentedTo}\` costing \`${rentalFormattedPrice}\` on ${rentalDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let rentalNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${rentalFormattedThisSaleCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${rentalFormattedCurrentCommission}\`.\n\n**Reason:** ${rentalReason}.`)
						.setColor('#1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [rentalNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully logged this Car Rental.\n\nDetails about this rental:\n> Rental Price: \`${rentalFormattedPrice}\`\n> Your Commission: \`${rentalFormattedThisSaleCommission}\`\n\nYour weekly commission is now: \`${rentalFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addYPAdvertModal':
				let ypAdSalesmanName;
				if (interaction.member.nickname) {
					ypAdSalesmanName = interaction.member.nickname;
				} else {
					ypAdSalesmanName = interaction.member.user.username;
				}

				let now = Math.floor(new Date().getTime() / 1000.0);
				let adDate = `<t:${now}:d>`;

				let screenshotLink = strCleanup(interaction.fields.getTextInputValue('screenshotInput'));

				if (!isValidUrl(screenshotLink)) { // validate photo link
					await interaction.editReply({
						content: `:exclamation: \`${screenshotLink}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
						ephemeral: true
					});
					return;
				}
				let allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
				if (!RegExp(allowedValues.join('|')).test(screenshotLink.toLowerCase())) { // validate photo link, again
					await interaction.editReply({
						content: `:exclamation: \`${screenshotLink}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
						ephemeral: true
					});
					return;
				}

				let ypAdPersonnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (ypAdPersonnelStats == null || ypAdPersonnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				let ypAdSalesmanCommission = 526;
				let formattedYpAdCommission = formatter.format(ypAdSalesmanCommission);
				let reason = `Yellow Pages ad listed on ${adDate}`

				await dbCmds.addCommission(interaction.member.user.id, ypAdSalesmanCommission);
				let currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				let embeds = new EmbedBuilder()
					.setTitle('A new YP Ad Reimbursement has been submitted!')
					.addFields(
						{ name: `Salesperson Name:`, value: `${ypAdSalesmanName} (<@${interaction.user.id}>)` },
						{ name: `Ad Date:`, value: `${adDate}` },
					)
					.setColor('DBB42C');

				let photosEmbed = new EmbedBuilder()
					.setColor('DBB42C')
					.setURL('https://echorp.net/')
					.setImage(screenshotLink);

				await interaction.client.channels.cache.get(process.env.YP_AD_REIMBURSEMENT_CHANNEL_ID).send({ embeds: [embeds, photosEmbed] });

				// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				let notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedYpAdCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.editReply({ content: `Successfully logged this Yellow Pages ad listing.\n\nDetails about this listing:\n> Your Commission: \`${formattedYpAdCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });

				break;
			default:
				await interaction.editReply({
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

			console.log(`Error occured at ${errTime} at file ${fileName}!`);

			let errString = error.toString();

			let gServUnavailIndc;

			if (errString === 'Error: The service is currently unavailable.') {
				gServUnavailIndc = '\`gServUnavailIndc: true\`';
			} else {
				gServUnavailIndc = '\`gServUnavailIndc: false\`';
			}

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ content: gServUnavailIndc, embeds: errorEmbed });
		}
	}
};