var Discord = require("discord.js");

var config = require("./config.json");

var bot = new Discord.Client();

var inChannel = false;

bot.on("ready", function () {
    console.log("Anime Radio Club Bot is up and running on " + bot.guilds.size + " servers");
	bot.user.setGame(`on ${bot.guilds.size} servers`);
});

bot.on("disconnected", function () {
    console.log("Disconnected from Discord");
    process.exit(1);
});

bot.on("message", function (message) {
    if (message.author.id != bot.user.id && (message.content[0] === "=" || message.content.indexOf (bot.user.toString()) == 0 )) {
        //console.log("Incoming command '" + message.content + "' from user " + message.author);
        var cmdTxt = message.content.split(" ")[0].substring(1);
        var suffix = message.content.substring(cmdTxt.length + 2);
        if (message.content.indexOf(bot.user.toString()) == 0){
            try {
                cmdTxt = message.content.split(" ")[1];
                suffix = message.content.substring(bot.user.toString().length+cmdTxt.length + 2);
            } catch (e){
                bot.sendMessage(message.channel,"Yes?");
                return;
            }
        }
		
		if (cmdTxt === "help") {
			message.channel.sendEmbed({
				description: `**ANIMERADIO.club Discord bot by Felix**
					**Usage:**
					After adding me to your server, join a voice channel and type \`=join\` to bind me to that voice channel.
					Keep in mind that you need to have the \`Manage Server\` permission to use this command.
					**Commands:**
					**\\=join**: Joins the voice channel you are currently in.
					**\\=leave**: Leaves the voice channel the bot is currently in.
					**\\=np**: Displays the currently playing song. (WIP)
					**Github:**
					https://github.com/lol123Xb/Anime-Radio-Club-Discord-Bot`,
				color: 3447003
			});
		}
		
        if (cmdTxt === "join") {
			if (!inChannel) {
				const voiceChannel = message.member.voiceChannel;
				if (message.member.hasPermission("MANAGE_GUILD") == true || message.author.id == config.owner) {
					bot.user.setStatus("online")
					inChannel = true;
					message.channel.sendMessage("Voice channel successfully joined!")
					message.member.voiceChannel.join().then(connection => {
					require('http').get("http://streaming.radionomy.com/AnimeRadioClub?lang=en-US%2cen%3bq%3d0.8", (res) => {
						connection.playStream(res);
					})
					})
					.catch(console.error);
					return
				}
				if (message.member.hasPermission("MANAGE_GUILD") == false) {
					message.reply(`Sorry you must have the "Manage Server" permission in order to use.`)
					return
				}
				if (!voiceChannel) {
					return message.reply(`Please be in a voice channel first!`);
				}
			}
		}
        
        if (cmdTxt === "leave") {
            if (inChannel) {
				if (message.member.hasPermission("MANAGE_GUILD") == true || message.author.id == config.owner) {
					const voiceChannel = message.member.voiceChannel;
					message.channel.sendMessage("Voice channel successfully left!")
					bot.user.setStatus("idle");
					voiceChannel.leave();
					inChannel = false;
					return
				}
				if (message.member.hasPermission("MANAGE_GUILD") == false) {
					message.reply(`Sorry you must have the "Manage Server" permission in order to use.`)
					return
				}
            }
			if (!inChannel) {
				if (message.member.hasPermission("MANAGE_GUILD") == false) {
					message.reply(`Sorry you must have the "Manage Server" permission in order to use.`)
					return
				}
				message.reply(`I am not currently in a voice channel. If it displays that I am then use \`=join\` to allow for \`=leave\` to work.`)
			}
        }
        
        if (message.author == bot.user) {
            return;
        }
    }
});

bot.login(config.token);
