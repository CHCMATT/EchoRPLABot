var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');
var personnelCmds = require('./personnelCmds.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function toTitleCase(str) {
	str = str.toLowerCase().split(' ');
	for (var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}

function strCleanup(str) {
	var cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

module.exports.modalSubmit = async (interaction) => {
	try {
		var modalID = interaction.customId;
		switch (modalID) {
			case 'addRegularCarSaleModal':
				var salesmanName;
				if (interaction.member.nickname) {
					salesmanName = interaction.member.nickname;
				} else {
					salesmanName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var soldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('soldToInput')));
				var vehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('vehicleNameInput')));
				var vehiclePlate = strCleanup(interaction.fields.getTextInputValue('vehiclePlateInput')).toUpperCase();
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var costPrice = (price * 0.90);
				var laProfit = price - costPrice;
				var commission25Percent = (laProfit * 0.25);
				var commission30Percent = (laProfit * 0.30);

				var formattedCostPrice = formatter.format(costPrice);
				var formattedLaProfit = formatter.format(laProfit);

				if (!notes || notes.toLowerCase() === "n/a") {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						)
						.setColor('023E8A')];
				} else {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('023E8A')];
				}

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: carSoldEmbed });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addCommission(interaction.member.user.id, commission25Percent, commission30Percent);
				var commissionArray = await dbCmds.readCommission(interaction.member.user.id);
				var weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				var thisSale25PercCommission = commission25Percent;
				var thisSale30PercCommission = commission30Percent;

				if (weeklyCarsSold < 100) {
					var overallCommission = commissionArray.commission25Percent;
					var thisSaleCommission = commission25Percent
					var commissionPercent = "25%";
				} else {
					var overallCommission = commissionArray.commission30Percent;
					var thisSaleCommission = commission30Percent;
					var commissionPercent = "30%";
				}

				var formatted25PercCommission = formatter.format(thisSale25PercCommission);
				var formatted30PercCommission = formatter.format(thisSale30PercCommission);
				var formattedThisSaleCommission = formatter.format(thisSaleCommission);
				var formattedOverallCommission = formatter.format(overallCommission);

				await editEmbed.editEmbed(interaction.client);
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);

				var newCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				var reason = `Car Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added  to <@${interaction.user.id}>'s commission:\n• **25%:** \`${formatted25PercCommission}\`\n• **30%:** \`${formatted30PercCommission}\`\n\nTheir new total is (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${newCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Luxury Autos Profit: \`${formattedLaProfit}\`\n> Your Commission: \`${formattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.`, ephemeral: true });
				break;
			case 'addSportsCarSaleModal':
				var salesmanName;
				if (interaction.member.nickname) {
					salesmanName = interaction.member.nickname;
				} else {
					salesmanName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var soldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('soldToInput')));
				var vehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('vehicleNameInput')));
				var vehiclePlate = strCleanup(interaction.fields.getTextInputValue('vehiclePlateInput')).toUpperCase();
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var costPrice = (price * 0.85);
				var laProfit = price - costPrice;
				var commission25Percent = (laProfit * 0.25);
				var commission30Percent = (laProfit * 0.30);

				var formattedCostPrice = formatter.format(costPrice);
				var formattedLaProfit = formatter.format(laProfit);

				if (!notes || notes.toLowerCase() === "n/a") {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new sports car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						)
						.setColor('0077B6')];
				} else {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new sports car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('0077B6')];
				}

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: carSoldEmbed });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addCommission(interaction.member.user.id, commission25Percent, commission30Percent);
				var commissionArray = await dbCmds.readCommission(interaction.member.user.id);
				var weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				var thisSale25PercCommission = commission25Percent;
				var thisSale30PercCommission = commission30Percent;

				if (weeklyCarsSold < 100) {
					var overallCommission = commissionArray.commission25Percent;
					var thisSaleCommission = commission25Percent
					var commissionPercent = "25%";
				} else {
					var overallCommission = commissionArray.commission30Percent;
					var thisSaleCommission = commission30Percent;
					var commissionPercent = "30%";
				}

				var formatted25PercCommission = formatter.format(thisSale25PercCommission);
				var formatted30PercCommission = formatter.format(thisSale30PercCommission);
				var formattedThisSaleCommission = formatter.format(thisSaleCommission);
				var formattedOverallCommission = formatter.format(overallCommission);

				await editEmbed.editEmbed(interaction.client);
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);

				var newCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				var reason = `Sports Car Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added  to <@${interaction.user.id}>'s commission:\n• **25%:** \`${formatted25PercCommission}\`\n• **30%:** \`${formatted30PercCommission}\`\n\nTheir new total is (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${newCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Luxury Autos Profit: \`${formattedLaProfit}\`\n> Your Commission: \`${formattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.`, ephemeral: true });
				break;
			case 'addTunerCarSaleModal':
				var salesmanName;
				if (interaction.member.nickname) {
					salesmanName = interaction.member.nickname;
				} else {
					salesmanName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var soldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('soldToInput')));
				var vehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('vehicleNameInput')));
				var vehiclePlate = strCleanup(interaction.fields.getTextInputValue('vehiclePlateInput')).toUpperCase();
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var costPrice = (price * 0.80);
				var laProfit = price - costPrice;
				var commission25Percent = (laProfit * 0.25);
				var commission30Percent = (laProfit * 0.30);

				var formattedCostPrice = formatter.format(costPrice);
				var formattedLaProfit = formatter.format(laProfit);

				if (!notes || notes.toLowerCase() === "n/a") {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new tuner car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						)
						.setColor('0096C7')];
				} else {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new tuner car has been sold!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('0096C7')];
				}

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: carSoldEmbed });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				await dbCmds.addCommission(interaction.member.user.id, commission25Percent, commission30Percent);
				var commissionArray = await dbCmds.readCommission(interaction.member.user.id);
				var weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				var thisSale25PercCommission = commission25Percent;
				var thisSale30PercCommission = commission30Percent;

				if (weeklyCarsSold < 100) {
					var overallCommission = commissionArray.commission25Percent;
					var thisSaleCommission = commission25Percent
					var commissionPercent = "25%";
				} else {
					var overallCommission = commissionArray.commission30Percent;
					var thisSaleCommission = commission30Percent;
					var commissionPercent = "30%";
				}

				var formatted25PercCommission = formatter.format(thisSale25PercCommission);
				var formatted30PercCommission = formatter.format(thisSale30PercCommission);
				var formattedThisSaleCommission = formatter.format(thisSaleCommission);
				var formattedOverallCommission = formatter.format(overallCommission);

				await editEmbed.editEmbed(interaction.client);
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);

				var newCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");
				var reason = `Tuner Car Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added  to <@${interaction.user.id}>'s commission:\n• **25%:** \`${formatted25PercCommission}\`\n• **30%:** \`${formatted30PercCommission}\`\n\nTheir new total is (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${newCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Luxury Autos Profit: \`${formattedLaProfit}\`\n> Your Commission: \`${formattedThisSaleCommission}\`\n\nYour weekly commission is now (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.`, ephemeral: true });
				break;
			case 'addEmployeeSaleModal':
				var salesmanName;
				if (interaction.member.nickname) {
					salesmanName = interaction.member.nickname;
				} else {
					salesmanName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var soldTo = toTitleCase(strCleanup(interaction.fields.getTextInputValue('soldToInput')));
				var vehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('vehicleNameInput')));
				var vehiclePlate = strCleanup(interaction.fields.getTextInputValue('vehiclePlateInput')).toUpperCase();
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var costPrice = (price * 0.80);
				var laProfit = price - costPrice;

				var formattedCostPrice = formatter.format(costPrice);
				var formattedLaProfit = formatter.format(laProfit);

				if (!notes || notes.toLowerCase() === "n/a") {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new car has been sold to an employee!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						)
						.setColor('0096C7')];
				} else {
					var carSoldEmbed = [new EmbedBuilder()
						.setTitle('A new car has been sold to an employee!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salesmanName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Car Sold To:`, value: `${soldTo}` },
							{ name: `Vehicle Name:`, value: `${vehicleName}` },
							{ name: `Vehicle Plate:`, value: `${vehiclePlate}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('0096C7')];
				}

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await interaction.client.channels.cache.get(process.env.CAR_SALES_CHANNEL_ID).send({ embeds: carSoldEmbed });

				await dbCmds.addOneSumm("countCarsSold");
				await dbCmds.addOneSumm("countWeeklyCarsSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "carsSold");
				var commissionArray = await dbCmds.readCommission(interaction.member.user.id);
				var weeklyCarsSold = await dbCmds.readSummValue("countWeeklyCarsSold");

				if (weeklyCarsSold < 100) {
					var overallCommission = commissionArray.commission25Percent;
					var commissionPercent = "25%";
				} else {
					var overallCommission = commissionArray.commission30Percent;
					var commissionPercent = "30%";
				}

				var formattedOverallCommission = formatter.format(overallCommission);

				await editEmbed.editEmbed(interaction.client);
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);

				var newCarsSoldTotal = await dbCmds.readSummValue("countCarsSold");

				await interaction.reply({ content: `Successfully added \`1\` to the \`Cars Sold\` counter - the new total is \`${newCarsSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Luxury Autos Profit: \`${formattedLaProfit}\`\n> Your Commission: \`n/a\`\n\nYour weekly commission is now (\`${commissionPercent}\`): \`${formattedOverallCommission}\`.`, ephemeral: true });
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


