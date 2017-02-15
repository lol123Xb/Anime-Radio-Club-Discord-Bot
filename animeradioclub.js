var Discord = require("discord.js");

var config = require("./config.json");

var bot = new Discord.Client();

const winston = require('winston');

const oneLine = require('common-tags').oneLine;

let listeners = 0;

bot.on("ready", function() {
    winston.info(oneLine `
			CLIENT: Anime Radio Club ready!
			${bot.user.username}#${bot.user.discriminator} (ID: ${bot.user.id})
			Currently in ${bot.guilds.size} servers.
		`);
    list();
});

function list() {
    bot.user.setGame(`for ${listeners} on ${bot.guilds.size} servers`);

    return setTimeout(list, 10000);
}

setInterval(() => {
    try {
        listeners = bot.voiceConnections
            .map(vc => vc.channel.members.filter(me => !(me.user.bot || me.selfDeaf || me.deaf)).size)
            .reduce((sum, members) => sum + members);
    } catch (error) {
        listeners = 0;
    }
}, 30000);

bot.on("disconnected", function() {
    console.log("Disconnected from Discord");
    process.exit(1);
});

bot.on("message", function(message) {
    if (message.author.id != bot.user.id && (message.content[0] === config.prefix || message.content[0] === config.backup_prefix || message.content.indexOf(bot.user.toString()) == 0)) {
        console.log("Incoming command '" + message.content + "' from user " + message.author);
        var cmdTxt = message.content.split(" ")[0].substring(1);
        var suffix = message.content.substring(cmdTxt.length + 2);
        if (message.content.indexOf(bot.user.toString()) == 0) {
            try {
                cmdTxt = message.content.split(" ")[1];
                suffix = message.content.substring(bot.user.toString().length + cmdTxt.length + 2);
            } catch (e) {
                bot.sendMessage(message.channel, "Yes?");
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
					**\\=pfix**: Changes the global prefix.
					**Github:**
					https://github.com/lol123Xb/Anime-Radio-Club-Discord-Bot`,
                color: 3447003
            });
        }

        if (cmdTxt === "np") {
            message.reply(`Sorry, this command is currently work in progress so it will not work right now.`);
        }

        if (cmdTxt === "pfix") {
            if (message.member.hasPermission("MANAGE_GUILD") == true || message.author.id == config.owner) {
                message.reply("**Note:**\nIf you set the prefix to more than One character, the commands will stop working. Please use our backup prefix to fix this by changing your prefix without needing to restart the bot.\n**Backup prefix:** " + `\`${config.backup_prefix}\``)
                var newpfix = message.content.substring(cmdTxt.length + 2);
                config.prefix = newpfix;
                winston.info(oneLine `Prefix changed to` + " " + newpfix)
                message.reply(`Prefix changed to` + " `" + newpfix + "`");
            }
        }

        if (cmdTxt === "join") {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) {
                return message.reply(`Please be in a voice channel first!`);
            }
            if (message.member.hasPermission("MANAGE_GUILD") == true || message.author.id == config.owner) {
                bot.user.setStatus("online")
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
        }


        if (cmdTxt === "leave") {
            const voiceChannel = message.member.voiceChannel;
            if (voiceChannel) {
                if (message.member.hasPermission("MANAGE_GUILD") == true || message.author.id == config.owner) {
                    message.channel.sendMessage("Voice channel successfully left!")
                    bot.user.setStatus("idle");
                    message.member.voiceChannel.leave();
                    return
                }
                if (message.member.hasPermission("MANAGE_GUILD") == false) {
                    message.reply(`Sorry you must have the "Manage Server" permission in order to use.`)
                    return
                }
            }
            if (!voiceChannel) {
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
