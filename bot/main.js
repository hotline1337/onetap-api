const Discord = require("discord.js");
const fs = require("fs");
const Shoppy = module.require('shoppy.gg');
const https = require("https");
const query = require("querystring");

const client = new Discord.Client();
const prefix = "g->";
client.commands = new Discord.Collection();

const API = new Shoppy.API("");
const products = ["[Onetap.com] Javascript Package", "[Nemesis] Master Package", "[Onetap.com] Master Package", "[GameSense] Master Package"];

let q = "";
let current_script_id = "";
let options = {
	encoding: "application/x-www-form-urlencoded",
	hostname: "api.onetap.com",
	port: 443,
	path: `/cloud/scripts/${current_script_id}/subscriptions/`,
	method: "POST",
	headers:
	{
		"X-Api-Id": "",
		"X-Api-Secret": "",
		"X-Api-Key": "",
		"Content-Type": "application/x-www-form-urlencoded",
		"Content-Length": Buffer.byteLength(q)
	}
}

client.on('ready', async () =>
{
	console.log("Simple Discord Shoppy Bot by hotline | version 1.1")
	console.log(`Logged in as ${client.user.tag}`);
	console.log("Invite link: " + await client.generateInvite(["ADMINISTRATOR"]));
	try
	{
		await client.user.setStatus('dnd');
		await client.user.setActivity("hotline's coding service",
		{
			type: 'WATCHING'
		});
	}
	catch (error)
	{
		console.error(`Failed to start.`);
	}
	console.log("Bot started");
});

client.on('message', async msg =>
{
	if (msg.author.bot) return;
	if (msg.content.includes(prefix) && msg.channel.type !== "dm")
	{
		try
		{
			const arguments = msg.content.split(' ').slice(1); // All arguments behind the command name with the prefix
			const id = arguments.join(' '); // Amount of messages which should be deleted
			msg.delete(
			{
				timeout: 10
			});
			if (!id) return msg.reply('No order id has been provided!')
				.then(msg =>
				{
					msg.delete(
					{
						timeout: 2000
					});
				});

			if (id.length != 36) return msg.reply('Invalid order id!')
				.then(msg =>
				{
					msg.delete(
					{
						timeout: 2000
					});
				});

			fs.readFile('used_ids.txt', 'utf8', function (err, data)
			{
				if (err) return console.log(err);

				const already_purchased = data.split("\n");
				for (const i in already_purchased)
				{
					if (already_purchased[i] == id) return msg.reply("This product has been already claimed!")
						.then(msg =>
						{
							msg.delete(
							{
								timeout: 2000
							});
						});
				}

				API.getSpecificOrder(id)
					.then(data =>
					{})
					.catch(items =>
					{
						if (items.delivered != 1) return msg.reply('This product was not purchased!')
							.then(msg =>
							{
								msg.delete(
								{
									timeout: 2000
								});
							});
						const product_title = items.product.title;

						let product_role = products.indexOf(product_title);
						switch (product_role)
						{
						case 0:
							product_role = "ONETAP JS";
							break;
						case 1:
							product_role = "NEMESIS";
							break;
						case 2:
							product_role = "ONETAP MASTER PACKAGE";
							break;
						case 3:
							product_role = "GAMESENSE";
							break;
						default:
							return msg.reply("An unknown error occured!")
								.then(msg =>
								{
									msg.delete(
									{
										timeout: 2000
									});
								});
						}

						const server_role = msg.guild.roles.cache.find(role => role.name === product_role);
						const member_has_server_role = msg.member.roles.cache.some(role => role.name === product_role);
						if (member_has_server_role)
						{
							return msg.reply("You already have that package!")
								.then(msg =>
								{
									msg.delete(
									{
										timeout: 2000
									});
								});
						}

						msg.member.roles.add(server_role);
						if (items.custom_fields[0] != undefined)
						{
							q = query.stringify(
							{
								'user_id': items.custom_fields[0].value
							});
							options.headers["Content-Length"] = Buffer.byteLength(q);

							const req = https.request(options, (res) =>
							{
								console.log('statusCode:', res.statusCode);

								let body = '';
								res.setEncoding("utf8");

								res.on('data', function (chunk)
								{
									body += chunk;
								})
								res.on('end', function ()
								{
									console.log(`221: ${msg.author} has claimed ${product_role}!`);
								})
							});

							req.on('error', (e) =>
							{
								console.error("error: ", e);
							})
							req.write(q);
							req.end();

							current_script_id = "";
							const req2 = https.request(options, (res) =>
							{
								console.log('statusCode:', res.statusCode);

								let body = '';
								res.setEncoding("utf8");

								res.on('data', function (chunk)
								{
									body += chunk;
								})
								res.on('end', function ()
								{
									console.log(`225: ${msg.author} has claimed ${product_role}!`);
								})
							});

							req2.on('error', (e) =>
							{
								console.error("error:", e);
							})
							req2.write(q);
							req2.end();
						}

						msg.reply("Thank you for purchasing " + product_title)
							.then(msg =>
							{
								msg.delete(
								{
									timeout: 2000
								});
							});

						fs.appendFile('used_ids.txt', id + "\n", function (err)
						{
							if (err) return console.log(err);
						});

					});
			});
		}
		catch (e)
		{
			console.log(e.stack);
		}
	}
});
client.login(process.env.token);

// Some handle uncaught exceptions.
process.on("uncaughtException", err =>
{
	console.error("An unknown and unexpected error occurred! x.x.", err);
});

// Some what handle unhandled rejections.
process.on("unhandledRejection", err =>
{
	console.error("An unknown and unexpected rejection occurred! x.x.", err);
});
