var Discord = require("discord.js");

var config = require("./config.json");

var bot = new Discord.Client();

const winston = require('winston');

const oneLine = require('common-tags').oneLine;

let listeners = 0;

const ytdl = require('ytdl-core')
let stream = ytdl("https://www.youtube.com/watch?v=ItZWRLmnlrk")

const fs = require('fs')
const request = require("request");

bot.on("ready", function() {
    winston.info(oneLine `
			CLIENT: Anime Radio Club ready!
			${bot.user.username}#${bot.user.discriminator} (ID: ${bot.user.id})
			Currently in ${bot.guilds.size} servers.
		`);
    bot.user.setGame(`Type >help`, "https://www.twitch.tv/24_7_chill_piano");
});

setInterval(() => {
    try {
        listeners = bot.voiceConnections
            .map(vc => vc.channel.members.filter(me => !(me.user.bot || me.selfDeaf || me.deaf)).size)
            .reduce((sum, members) => sum + members);
    }
    catch (error) {
        listeners = 0;
    }
}, 30000);

bot.on("disconnected", function() {
    console.log("Disconnected from Discord");
    process.exit(1);
});

bot.on("message", function(message) {
    if (message.author.id != bot.user.id && (message.content[0] === config.prefix || message.content[0] === config.backup_prefix || message.content.indexOf(bot.user.toString()) == 0)) {
        var cmdTxt = message.content.split(" ")[0].substring(1);
        var suffix = message.content.substring(cmdTxt.length + 2);
        if (message.content.indexOf(bot.user.toString()) == 0) {
            try {
                cmdTxt = message.content.split(" ")[1];
                suffix = message.content.substring(bot.user.toString().length + cmdTxt.length + 2);
            }
            catch (e) {
                message.channel.send("Yes?");
                return;
            }
        }

        if (cmdTxt === "help") {
            const embed = new Discord.RichEmbed()
                .setTitle('ANIMERADIO.club Discord Bot')
                .setAuthor('Felix', 'http://orig13.deviantart.net/f7a2/f/2016/343/a/b/isana_yashiro_minimal_icon_by_lol123xb-dar48hx.jpg')
                .setColor(3447003)
                .addField(`**Usage:**`, `After adding me to your server, join a voice channel and type \`${config.prefix}join\` to bind me to that voice channel. \nKeep in mind that you need to have the \`Manage Server\` permission to use this command.`)
                .addField(`**Commands:**`, `\n**\\${config.prefix}join**: Joins the voice channel you are currently in. \n**\\${config.prefix}leave**: Leaves the voice channel the bot is currently in. \n**\\${config.prefix}np**: Displays the currently playing song. \n**\\${config.prefix}pfix**: Changes the global prefix.\n**\\${config.prefix}volume**: Change the volume of the bot.\n**\\${config.prefix}report**: Send a report of an error or something.`)
                .addField(`**Github:**`, `https://github.com/lol123Xb/Anime-Radio-Club-Discord-Bot`)
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
                .addField(`:musical_note:  Listeners:`, `${listeners}`, true)
                .addField(`:desktop:  Servers:`, `${bot.guilds.size}`, true)
                .addField(':computer: Join Server', 'http://discord.gg/WCxHjFX', true)
                .addField(':bust_in_silhouette: Invite Bot', 'https://goo.gl/ZjGBn7', true)

                .setThumbnail(bot.user.avatarURL)

            message.channel.sendEmbed(
                embed
            );
        }

        if (cmdTxt === "np") {
            request('https://dl.dropbox.com/s/63g5bi02b1o6sxk/Snip.txt').pipe(fs.createWriteStream('piano.txt'))
            message.channel.startTyping();
            for (i = 0; i < (1); i++) {
                setTimeout(function() {
                    fs.readFile('piano.txt', 'utf8', function(err, fileContents) {
                        if (err) throw err;
                        message.channel.send(":notes: Now playing\n```" + fileContents + "```\n**By the way, the livestream starts 4 hours before the live part for Youtube livestreams. I have no idea how to fix that so the now playing doesn't 100% reflect what AnimeRadioClub is currently playing.**")
                    });
                }, 3 * 1000)
            }
            message.channel.stopTyping();
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

        if (cmdTxt === "reboot") {
            if (message.author.id === config.owner) {
                message.channel.send(":wave: Rebooting!")
                setTimeout(function() {
                    process.exit(1);
                }, 3 * 1000)
            }
        }

        if (cmdTxt === "volume") {
            var input = message.content.substring(cmdTxt.length + 2);

            const voiceConnection = bot.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
            if (voiceConnection === null) return message.channel.send('```Not in a voice channel.```');

            const dispatcher = voiceConnection.player.dispatcher;

            if (input > 200 || input < 0) return message.channel.send('```Volume out of range!```').then((response) => {
                response.delete(5000);
                return
            });
            else {
                message.channel.send("```Volume must be between 1 and 200!```")
                return
            }

            message.channel.send("```Volume set to " + input + '```');
            dispatcher.setVolume((input / 100));
        }

        if (cmdTxt === "maxlisteners") {
            if (message.author.id === config.owner) {
                process.setMaxListeners(100);
                console.log("Set max listeners to 100")
            }
        }

        if (cmdTxt === "report") {
            var input = message.content.substring(cmdTxt.length + 2);
            console.log("Incoming report '" + input + "' from user " + message.author.username + "#" + message.author.discriminator);
            message.reply(":thumbsup: Your report has been sent!")
        }

        if (cmdTxt === "join") {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) {
                message.reply(`Please be in a voice channel first!`);
                return
            }
            else {
                bot.user.setStatus("online")
                message.channel.send("Voice channel successfully joined!")
                message.member.voiceChannel.join().then(connection => {
                    message.member.voiceChannel.join().then(connection => {
                        connection.playStream(stream);
                    })
                })
            }
        }


        if (cmdTxt === "leave") {
            const voiceChannel = message.member.voiceChannel;
            if (voiceChannel) {
                message.channel.send("Voice channel successfully left!")
                bot.user.setStatus("idle");
                message.member.voiceChannel.leave();
                return
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
