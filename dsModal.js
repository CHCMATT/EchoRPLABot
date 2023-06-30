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

module.exports.modalSubmit = async (interaction) => {
	try {
		let modalID = interaction.customId;
		switch (modalID) {
			case 'addRegularCarSaleModal':
				await interaction.deferReply({ ephemeral: true });

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
				let regCommission25Percent = (regLaProfit * 0.25);
				let regCommission30Percent = (regLaProfit * 0.30);

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
				if (Math.round(regCommission30Percent) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, regCommission25Percent, regCommission30Percent);
				}
				let regCommissionArray = await dbCmds.readCommission(interaction.member.user.id);
				let regWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				let regCommissionPercent, regThisSaleCommission, regCurrentCommission;

				if (regWeeklyCarsSold < 100) {
					regCommissionPercent = "25%";
					regThisSaleCommission = regCommission25Percent
					regCurrentCommission = regCommissionArray.commission25Percent;
				} else {
					regCommissionPercent = "30%";
					regThisSaleCommission = regCommission30Percent;
					regCurrentCommission = regCommissionArray.commission30Percent;
				}

				let regOverallCommission25Percent = regCommissionArray.commission25Percent;
				let regOverallCommission30Percent = regCommissionArray.commission30Percent;
				let regFormattedOverall25PercentComm = formatter.format(regOverallCommission25Percent);
				let regFormattedOverall30PercentComm = formatter.format(regOverallCommission30Percent);
				let regFormattedThisSale25PercentComm = formatter.format(regCommission25Percent);
				let regFormattedThisSale30PercentComm = formatter.format(regCommission30Percent);
				let regFormattedThisSaleCommission = formatter.format(regThisSaleCommission);
				let regFormattedCurrentCommission = formatter.format(regCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let regNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				if (Math.round(regCommission30Percent) > 0) {
					let regReason = `Car Sale to \`${regSoldTo}\` costing \`${regFormattedPrice}\` on ${regSaleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let regNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added to <@${interaction.user.id}>'s commission:\n• **25%:** \`${regFormattedThisSale25PercentComm}\`\n• **30%:** \`${regFormattedThisSale30PercentComm}\`\n\nTheir new totals are:\n• **25%:** \`${regFormattedOverall25PercentComm}\`\n• **30%:** \`${regFormattedOverall30PercentComm}\`\n\n**Reason:** ${regReason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [regNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${regNewCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${regFormattedPrice}\`\n> Cost Price: \`${regFormattedCostPrice}\`\n> Luxury Autos Profit: \`${regFormattedLaProfit}\`\n> Your Commission: \`${regFormattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${regCommissionPercent}\`): \`${regFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addSportsCarSaleModal':
				await interaction.deferReply({ ephemeral: true });

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

				let sportsFormattedPrice = formatter.format(sportsPrice);

				if (isNaN(sportsPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('sportsPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let sportsCostPrice = (sportsPrice * 0.85);
				let sportsLaProfit = sportsPrice - sportsCostPrice;
				let sportsCommission25Percent = (sportsLaProfit * 0.25);
				let sportsCommission30Percent = (sportsLaProfit * 0.30);

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
				if (Math.round(sportsCommission30Percent) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, sportsCommission25Percent, sportsCommission30Percent);
				}
				let sportsCommissionArray = await dbCmds.readCommission(interaction.member.user.id);
				let sportsWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				let sportsCommissionPercent, sportsThisSaleCommission, sportsCurrentCommission;

				if (sportsWeeklyCarsSold < 100) {
					sportsCommissionPercent = "25%";
					sportsThisSaleCommission = sportsCommission25Percent
					sportsCurrentCommission = sportsCommissionArray.commission25Percent;
				} else {
					sportsCommissionPercent = "30%";
					sportsThisSaleCommission = sportsCommission30Percent;
					sportsCurrentCommission = sportsCommissionArray.commission30Percent;
				}

				let sportsOverallCommission25Percent = sportsCommissionArray.commission25Percent;
				let sportsOverallCommission30Percent = sportsCommissionArray.commission30Percent;
				let sportsFormattedOverall25PercentComm = formatter.format(sportsOverallCommission25Percent);
				let sportsFormattedOverall30PercentComm = formatter.format(sportsOverallCommission30Percent);
				let sportsFormattedThisSale25PercentComm = formatter.format(sportsCommission25Percent);
				let sportsFormattedThisSale30PercentComm = formatter.format(sportsCommission30Percent);
				let sportsFormattedThisSaleCommission = formatter.format(sportsThisSaleCommission);
				let sportsFormattedCurrentCommission = formatter.format(sportsCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let sportsNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				if (Math.round(sportsCommission30Percent) > 0) {
					let sportsReason = `Sports Car Sale to \`${sportsSoldTo}\` costing \`${sportsFormattedPrice}\` on ${sportsSaleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let sportsNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added to <@${interaction.user.id}>'s commission:\n• **25%:** \`${sportsFormattedThisSale25PercentComm}\`\n• **30%:** \`${sportsFormattedThisSale30PercentComm}\`\n\nTheir new totals are:\n• **25%:** \`${sportsFormattedOverall25PercentComm}\`\n• **30%:** \`${sportsFormattedOverall30PercentComm}\`\n\n**Reason:** ${sportsReason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [sportsNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${sportsNewCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${sportsFormattedPrice}\`\n> Cost Price: \`${sportsFormattedCostPrice}\`\n> Luxury Autos Profit: \`${sportsFormattedLaProfit}\`\n> Your Commission: \`${sportsFormattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${sportsCommissionPercent}\`): \`${sportsFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addTunerCarSaleModal':
				await interaction.deferReply({ ephemeral: true });

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

				let tunerFormattedPrice = formatter.format(tunerPrice);

				if (isNaN(tunerPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('tunerPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let tunerCostPrice = (tunerPrice * 0.80);
				let tunerLaProfit = tunerPrice - tunerCostPrice;
				let tunerCommission25Percent = (tunerLaProfit * 0.25);
				let tunerCommission30Percent = (tunerLaProfit * 0.30);

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
				if (Math.round(tunerCommission30Percent) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, tunerCommission25Percent, tunerCommission30Percent);
				}
				let tunerCommissionArray = await dbCmds.readCommission(interaction.member.user.id);
				let tunerWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				let tunerCommissionPercent, tunerThisSaleCommission, tunerCurrentCommission;

				if (tunerWeeklyCarsSold < 100) {
					tunerCommissionPercent = "25%";
					tunerThisSaleCommission = tunerCommission25Percent
					tunerCurrentCommission = tunerCommissionArray.commission25Percent;
				} else {
					tunerCommissionPercent = "30%";
					tunerThisSaleCommission = tunerCommission30Percent;
					tunerCurrentCommission = tunerCommissionArray.commission30Percent;
				}

				let tunerOverallCommission25Percent = tunerCommissionArray.commission25Percent;
				let tunerOverallCommission30Percent = tunerCommissionArray.commission30Percent;
				let tunerFormattedOverall25PercentComm = formatter.format(tunerOverallCommission25Percent);
				let tunerFormattedOverall30PercentComm = formatter.format(tunerOverallCommission30Percent);
				let tunerFormattedThisSale25PercentComm = formatter.format(tunerCommission25Percent);
				let tunerFormattedThisSale30PercentComm = formatter.format(tunerCommission30Percent);
				let tunerFormattedThisSaleCommission = formatter.format(tunerThisSaleCommission);
				let tunerFormattedCurrentCommission = formatter.format(tunerCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let tunerNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				if (Math.round(tunerCommission30Percent) > 0) {
					let tunerReason = `Tuner Car Sale to \`${tunerSoldTo}\` costing \`${tunerFormattedPrice}\` on ${tunerSaleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let tunerNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added to <@${interaction.user.id}>'s commission:\n• **25%:** \`${tunerFormattedThisSale25PercentComm}\`\n• **30%:** \`${tunerFormattedThisSale30PercentComm}\`\n\nTheir new totals are:\n• **25%:** \`${tunerFormattedOverall25PercentComm}\`\n• **30%:** \`${tunerFormattedOverall30PercentComm}\`\n\n**Reason:** ${tunerReason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [tunerNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${tunerNewCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${tunerFormattedPrice}\`\n> Cost Price: \`${tunerFormattedCostPrice}\`\n> Luxury Autos Profit: \`${tunerFormattedLaProfit}\`\n> Your Commission: \`${tunerFormattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${tunerCommissionPercent}\`): \`${tunerFormattedCurrentCommission}\`.`, ephemeral: true });
				break;
			case 'addEmployeeSaleModal':
				await interaction.deferReply({ ephemeral: true });

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

				let empFormattedPrice = formatter.format(empPrice);

				if (isNaN(empPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('empPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

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
				let empCommissionArray = await dbCmds.readCommission(interaction.member.user.id);
				let empWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				let empOverallCommission, empCommissionPercent;
				if (empWeeklyCarsSold < 100) {
					empOverallCommission = empCommissionArray.commission25Percent;
					empCommissionPercent = "25%";
				} else {
					empOverallCommission = empCommissionArray.commission30Percent;
					empCommissionPercent = "30%";
				}

				let empFormattedOverallCommission = formatter.format(empOverallCommission);

				await editEmbed.editMainEmbed(interaction.client);
				await editEmbed.editStatsEmbed(interaction.client);

				let empNewCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${empNewCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${empFormattedPrice}\`\n> Cost Price: \`${empFormattedCostPrice}\`\n> Luxury Autos Profit: \`${empFormattedLaProfit}\`\n> Your Commission: \`n/a\`\n\nYour weekly commission is now (\`${empCommissionPercent}\`): \`${empFormattedOverallCommission}\`.`, ephemeral: true });
				break;
			case 'addCarRentalModal':
				await interaction.deferReply({ ephemeral: true });

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

				let rentalFormattedPrice = formatter.format(rentalPrice);

				if (isNaN(rentalPrice)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('rentalPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let rentalCommission25Percent = (rentalPrice * 0.50);
				let rentalCommission30Percent = (rentalPrice * 0.50);

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

				if (Math.round(rentalCommission30Percent) > 0) {
					await dbCmds.addCommission(interaction.member.user.id, rentalCommission25Percent, rentalCommission30Percent);
				}
				let rentalCommissionArray = await dbCmds.readCommission(interaction.member.user.id);
				let rentalWeeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				let rentalCommissionPercent, rentalThisSaleCommission, rentalCurrentCommission;

				if (rentalWeeklyCarsSold < 100) {
					rentalCommissionPercent = "25%";
					rentalThisSaleCommission = rentalCommission25Percent
					rentalCurrentCommission = rentalCommissionArray.commission25Percent;
				} else {
					rentalCommissionPercent = "30%";
					rentalThisSaleCommission = rentalCommission30Percent;
					rentalCurrentCommission = rentalCommissionArray.commission30Percent;
				}

				let rentalOverallCommission25Percent = rentalCommissionArray.commission25Percent;
				let rentalOverallCommission30Percent = rentalCommissionArray.commission30Percent;
				let rentalFormattedOverall25PercentComm = formatter.format(rentalOverallCommission25Percent);
				let rentalFormattedOverall30PercentComm = formatter.format(rentalOverallCommission30Percent);
				let rentalFormattedThisSale25PercentComm = formatter.format(rentalCommission25Percent);
				let rentalFormattedThisSale30PercentComm = formatter.format(rentalCommission30Percent);
				let rentalFormattedThisSaleCommission = formatter.format(rentalThisSaleCommission);
				let rentalFormattedCurrentCommission = formatter.format(rentalCurrentCommission);

				await editEmbed.editMainEmbed(interaction.client);

				if (Math.round(rentalCommission30Percent) > 0) {
					let rentalReason = `Car Rented to \`${rentedTo}\` costing \`${rentalFormattedPrice}\` on ${rentalDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let rentalNotificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added to <@${interaction.user.id}>'s commission:\n• **25%:** \`${rentalFormattedThisSale25PercentComm}\`\n• **30%:** \`${rentalFormattedThisSale30PercentComm}\`\n\nTheir new totals are:\n• **25%:** \`${rentalFormattedOverall25PercentComm}\`\n• **30%:** \`${rentalFormattedOverall30PercentComm}\`\n\n**Reason:** ${rentalReason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [rentalNotificationEmbed] });
				}

				await interaction.editReply({ content: `Successfully logged this Car Rental.\n\n\Details about this rental:\n> Rental Price: \`${rentalFormattedPrice}\`\n> Your Commission: \`${rentalFormattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${rentalCommissionPercent}\`): \`${rentalFormattedCurrentCommission}\`.`, ephemeral: true });
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
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
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
	}
};