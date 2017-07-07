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
    bot.user.setGame(`Type >help`);
});

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
                message.channel.send("Yes?");
                return;
            }
        }

        if (cmdTxt === "help") {
            const embed = new Discord.RichEmbed()
                .setTitle('ANIMERADIO.club Discord Bot')
                .setAuthor('Felix', 'http://orig13.deviantart.net/f7a2/f/2016/343/a/b/isana_yashiro_minimal_icon_by_lol123xb-dar48hx.jpg')
                .setColor(3447003)
                .setDescription(`**Usage:**
After adding me to your server, join a voice channel and type \`${config.prefix}join\` to bind me to that voice channel.
Keep in mind that you need to have the \`Manage Server\` permission to use this command.
**Commands:**
**\\${config.prefix}join**: Joins the voice channel you are currently in.
**\\${config.prefix}leave**: Leaves the voice channel the bot is currently in.
**\\${config.prefix}np**: Displays the currently playing song. (WIP)
**\\${config.prefix}pfix**: Changes the global prefix.
**Github:**
https://github.com/lol123Xb/Anime-Radio-Club-Discord-Bot`)
                .setThumbnail(bot.user.avatarURL)

            message.channel.sendEmbed(
                embed
            );
        }

        if (cmdTxt === "stats") {
            const embed = new Discord.RichEmbed()
                .setTitle('ANIMERADIO.club Discord Bot')
                .setAuthor('Felix', 'http://orig13.deviantart.net/f7a2/f/2016/343/a/b/isana_yashiro_minimal_icon_by_lol123xb-dar48hx.jpg')
                .setColor(3447003)
                .setDescription(`**Statistics:**
			Listeners: ${listeners}
			Servers: ${bot.guilds.size}`)
                .setThumbnail(bot.user.avatarURL)

            message.channel.sendEmbed(
                embed
            );
        }


        if (cmdTxt === "np") {
            message.reply(`Sorry, this command is currently work in progress so it will not work right now. So just check on this link here, what is currently playing: <https://www.radionomy.com/en/radio/animeradioclub/index>`);
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
                message.channel.send("Voice channel successfully joined!")
                message.member.voiceChannel.join().then(connection => {
                        require('http').get("http://streaming.radionomy.com/AnimeRadioClub?lang=en-US%2cen%3bq%3d0.8", (res) => {
                            connection.playStream(res);
                        })
                    })
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
                    message.channel.send("Voice channel successfully left!")
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
                message.reply(`I am not currently in a voice channel. If it displays that I am then use \`>join\` to allow for \`>leave\` to work.`)
            }
        }

        if (message.author == bot.user) {
            return;
        }
    }
});

bot.login(config.token);
