var fs = require('fs');
require("dotenv/config");
const cron = require('node-cron');
var mongoose = require("mongoose");
var startup = require('./startup.js');
var interact = require('./dsInteractions.js');
var commissionCmds = require('./commissionCmds.js');
var { Client, Collection, GatewayIntentBits } = require('discord.js');

var client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Collection();
client.buttons = new Collection();

client.login(process.env.TOKEN);

var fileParts = __filename.split(/[\\/]/);
var fileName = fileParts[fileParts.length - 1];

cron.schedule('0 21 * * SAT', function () { commissionCmds.weeklyReport(client); }); // runs at 21:00 every Saturday

client.once('ready', async () => {
	console.log(`[${fileName}] The client is starting up!`);
	mongoose.set("strictQuery", false);
	mongoose.connect(process.env.MONGO_URI, {
		keepAlive: true
	});
	console.log(`[${fileName}] Connected to Mongo!`);

	var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Find all the files in the command folder that end with .js
	var cmdList = []; // Create an empty array for pushing each command file to
	for (var file of commandFiles) { // For each file in command files group
		var command = require(`./commands/${file}`); // Get the information that is in the file
		console.log(`[${fileName}] Added ${file}!`); // Log that the command was added
		cmdList.push(command); // push that command to the array
		client.commands[command.name] = command; // Save the command name and command information to the client
	}
	console.log(`[${fileName}] Getting commands for Server ID ${process.env.DISCORD_SERVER_ID}.`);
	var allCommands = await client.guilds.cache.get(process.env.DISCORD_SERVER_ID).commands.set(cmdList) // Sets all the commands
		.catch(console.error);
	var cmdIDs = allCommands.keys();
	for (let i = 0; i < allCommands.size; i++) {
		var cmdID = cmdIDs.next().value;
		var cmdName = await allCommands.get(cmdID).name;
		let permission = client.commands[cmdName].permission;
		if (permission != undefined) { // If no permissions are given, don't update any permissions
			if (permission.length == undefined) { // If the permission isn't already an array (more than 1 permission), turn it into an array as that is what the function requires
				permission = [permission];
			}
			client.guilds.cache.get(process.env.DISCORD_SERVER_ID).commands.permissions.set({ command: cmdID, permissions: permission })
				.catch(console.error);
		}
	}

	interact(client); // Fire whenever an interaction is created
	console.log(`[${fileName}] Connected to ${client.guilds.cache.size} guild(s).`); // Lists the number of guilds that the client is connected to
	var keys = client.guilds.cache.keys(); // Gets the keys for the map object from the guilds object
	for (var entry of keys) { // For each guild
		console.log(`[${fileName}] Connected to guild ID ${entry}.`); // Log the guild Key (guild.id)
	}
	console.log(`[${fileName}] Client is ready.`);

	await startup.startUp(client);
});