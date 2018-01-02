const Discord = require("discord.js");
const client = new Discord.Client();
var config = require("./config.json");
const request = require("request");
const sql = require("sqlite");
sql.open("./guilds.sqlite");
const version = "2.0"

let listeners = 0;

client.on('ready', () => {
    var playing = ["Listening to Anime songs", `on ${client.guilds.size.toLocaleString()} servers`, "Type >help to get started!", `for ${listeners} people!`]
    var interval = setInterval(function() {
        var game = Math.floor((Math.random() * playing.length) + 0);
        client.user.setGame(playing[game], "https://www.twitch.tv/24_7_chill_piano")
    }, 35 * 1000);
    console.log("Anime Radio Club, rolling out!")
});

setInterval(() => {
    try {
        listeners = client.voiceConnections
            .map(vc => vc.channel.members.filter(me => !(me.user.bot || me.selfDeaf || me.deaf)).size)
            .reduce((sum, members) => sum + members);
    }
    catch (error) {
        listeners = 0;
    }
}, 30000);


client.on("message", message => {
    if (message.channel.type === 'dm') return;
    if (message.channel.type !== 'text') return;
    sql.get(`SELECT * FROM guilds WHERE guildId ="${message.guild.id}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO guilds (guildId, prefix) VALUES (?, ?)", [message.guild.id, ">"]);
        }
    }).catch(() => {
        console.error;
        sql.run("CREATE TABLE IF NOT EXISTS guilds (guildId TEXT, prefix TEXT)").then(() => {
            sql.run("INSERT INTO guilds (guildId, prefix) VALUES (?, ?)", [message.guild.id, ">"]);
        });
    });

    if (message.author.bot) return;
    sql.get(`SELECT * FROM guilds WHERE guildId ="${message.guild.id}"`).then(row => {
        const prefix = row.prefix;
        const args = message.content.split(" ");
        let command = args[0];
        command = command.slice(prefix.length)
        if (!message.content.startsWith(prefix)) return;

        //Miscellaneous commands
        if (command === "ping") {
            message.channel.send("Ping?").then(message => {
                message.edit(`Pong! - ${Math.round(client.ping)} ms`);
            });
        }

        if (command === "restart") {
            if (message.author.id === config.owner) {
                message.channel.send(":wave: Rebooting!")
                setTimeout(function() {
                    process.exit(1);
                }, 3 * 1000)
            }
            else {
                message.channel.send("I'm sorry, only the bot creator can use this command!")
            }
        }

        if (command === "setprefix") {
            if (message.author.id === config.owner) {
                const newPrefix = args[1];
                sql.run(`UPDATE guilds SET prefix = replace(prefix, '${row.prefix}', '${newPrefix}') WHERE guildId = ${message.guild.id}`);
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success:', `The prefix for **${message.guild.name}** is now **${newPrefix}**`)

                message.channel.sendEmbed(embed);
                return
            }
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('No Permissions:', "I'm sorry, but you don't have the `ADMINISTRATOR` permission to use this command.")

                message.channel.sendEmbed(embed);
                return
            }
            const newPrefix = args.slice(1).join(" ");
            sql.run(`UPDATE guilds SET prefix = replace(prefix, '${row.prefix}', '${newPrefix}') WHERE guildId = ${message.guild.id}`);
            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Success:', `The prefix for **${message.guild.name}** is now **${newPrefix}**`)

            message.channel.sendEmbed(embed);
        }

        if (command === "invite") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Invite me to your server!', '[Click Here](https://discordapp.com/oauth2/authorize?client_id=273299834470006786&scope=bot&permissions=8)')
                .addField('Get support!', '[Click Here](https://discord.gg/WCxHjFX)')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed);
        }

        if (command === "stats") {
            const game = client.user.presence.game || {};
            const embed = new Discord.RichEmbed()
                .setTitle('Anime Radio Club')
                .setAuthor('Felix#1330', 'https://scontent.fper1-1.fna.fbcdn.net/v/t1.0-9/18664210_1417816568256757_8140624121121409774_n.jpg?oh=e673a8d56882b92983c7bf7a3eb408e6&oe=5AA4AAA9')
                .setColor(3447003)
                .addField(':baby: Users', `${client.guilds.reduce((mem, g) => mem += g.memberCount, 0)}`, true)
                .addField(':desktop: Servers', `${client.guilds.size.toLocaleString()}`, true)
                .addField(':thinking: RAM usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
                .addField(':floppy_disk: Version', version, true)
                .addField(':video_game: Game', `${game.name || 'None'} ${game.streaming ? `[(Streaming)](${game.url})` : ''}`, true)
                .addField(`:musical_note:  Listeners:`, `${listeners}`, true)
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

        if (command === "report") {
            if (!args[1]) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Empty message!', "You must input a message to report! You cannot leave it blank.")

                message.channel.sendEmbed(embed)
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Report sent!', "We will look into it!")

            message.channel.sendEmbed(embed);
            const embed1 = new Discord.RichEmbed()
                .setTimestamp()
                .setColor("#000000")
                .addField('New Feedback!', `${message.author.username}#${message.author.discriminator} has sent in a suggestion!`)
                .addField('Report:', `${args[1]}`)
                .addField('Server:', `${message.guild.name} (${message.guild.id})`)
                .setThumbnail(client.user.avatarURL)

            client.channels.find("id", `397704312815484938`).sendEmbed(embed1)
            return
        }

        if (command === "request") {
            if (!args.slice(1).join(" ")) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Empty message!', "You must input a radio station you want to request to be added in! You cannot leave it blank.")

                message.channel.sendEmbed(embed)
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Suggestion sent!', "That radio station will be considered.")

            message.channel.sendEmbed(embed);
            const embed1 = new Discord.RichEmbed()
                .setTimestamp()
                .setColor(3447003)
                .addField('New Feedback!', `${message.author.username}#${message.author.discriminator} has sent in a suggestion!`)
                .addField('Suggestion:', `${args.slice(1).join(" ")}`)
                .addField('Server:', `${message.guild.name} (${message.guild.id})`)
                .setThumbnail(client.user.avatarURL)

            client.channels.find("id", `397705396518912020`).sendEmbed(embed1)
            return
        }

        if (command === "list") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Radio Station List:', '`1`: BlueAnimeIvana')
                .setFooter("Request a radio station to be added with the `request` command.")
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

        if (command === "play") {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "You must be in a Voice channel to use this command!")

                message.channel.sendEmbed(embed)
                return
            }
            if (!args[1]) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "No radio was selected!")

                message.channel.sendEmbed(embed)
                return
            }
            if (args[1] === "1") {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "Now playing BlueAnimeIvana in " + message.member.voiceChannel)

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.join().then(connection => {
                    require('http').get("http://streaming.radionomy.com/BlueAnimeIvana?lang=en-US%2cen%3bq%3d0.9", (res) => {
                        connection.playStream(res);
                    })
                })
            }
            else {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Radio does not exist!")

                message.channel.sendEmbed(embed)
                return
            }
        }

        if (command === "leave") {
            if (message.member.voiceChannel) {
                message.channel.send("Voice channel successfully left!")
                message.member.voiceChannel.leave();
                return
            }
            else {
                message.reply(`I am not currently in a voice channel! If you think this is a bug use \`play <radio number>\` and then \`leave\` to get me to leave.`)
            }
        }

        if (command === "help") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Command List:', '`help`: Displays this message.\n\
`ping`: Pong!\n\
`stats`: Check Anime Radio Club\'s stats.\n\
`setprefix`: Set the prefix for your guild.\n\
`restart`: Restart the bot (Only for bot owner).\n\
`play <radio number>`: Plays a radio station.\n\
`list`: Lists the possible radio stations to be played.\n\
`report`: Report a bug or something, not that you\'d know if that command was a bug.\n\
`request`: Request a suggestion for a radio station to be added in.')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

    });
});

client.login(config.token);
