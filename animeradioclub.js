const Discord = require("discord.js");
const client = new Discord.Client();
var config = require("./config.json");
const request = require("request");
const sql = require("sqlite");
sql.open("./guilds.sqlite");
sql.open("./time.sqlite");
var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
var myDate = date.substr(0, 10);

const version = "3.9"

let listeners = 0;

client.on('ready', () => {
    var playing = ["Anime songs", `on ${client.guilds.size.toLocaleString()} servers`, "Type >help to get started!", "http://animeradioclub.com/"]
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
    sql.get(`SELECT * FROM time WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO time (userId, date, amount) VALUES (?, ?, ?)", [message.author.id, '0000-00-00', 1]);
        }
    }).catch(() => {
        console.error;
        sql.run("CREATE TABLE IF NOT EXISTS time (userId TEXT, date TEXT, amount INTEGER)").then(() => {
            sql.run("INSERT INTO time (userId, date, amount) VALUES (?, ?, ?)", [message.author.id, '0000-00-00', 1]);
        });
    });

    if (message.author.bot) return;
    sql.get(`SELECT * FROM guilds WHERE guildId ="${message.guild.id}"`).then(row => {
        const prefix = row.prefix;
        const args = message.content.split(" ");
        let command = args[0];
        command = command.slice(prefix.length)
        if (!message.content.startsWith(prefix)) return;
        var reason1 = args.slice(1).join(" ");

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
            if (!args[1]) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error:', "Please input something to be the new prefix!")

                message.channel.sendEmbed(embed);
                return
            }
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

        if (command === "website") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('View our Website!', '[Click Here](http://animeradioclub.com/)')
                .addField('View our Source code on Github!', '[Click Here](https://github.com/lol123Xb/Anime-Radio-Club-Discord-Bot)')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed);
        }

        if (command === "donate") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Donate Paypal', '[Click Here](https://www.paypal.me/FelixDoan)')
                .setThumbnail(client.user.avatarURL)
                .setFooter("After donating, contact me directly, Felix#1330, to get yourself on the list of donators")

            message.channel.sendEmbed(embed);
        }

        if (command === "updates") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .setAuthor('Update Notes', client.user.avatarURL)
                .addField(`What's new in Version ${version}:`, `- Added in new radio stations`)
                .addField(`What was new in Previous Version:`, `- Removed \`AnimeDJ\` role requirement to use commands`)

            message.channel.sendEmbed(embed)
        }

        if (command === "donators") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .setAuthor('Donators', client.user.avatarURL)
                .setDescription("No one yet :(")
                .setFooter("Awesome list of people")

            message.channel.sendEmbed(embed)
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
                .addField(`:musical_note:  Listeners:`, `${listeners}`, true)
                .addField(':video_game: Game', `${game.name || 'None'} ${game.streaming ? `[(Streaming)](${game.url})` : ''}`, true)
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

        if (command === "report") {
            if (!args.slice(1).join(" ")) {
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
                .addField('New Report!', `${message.author.username}#${message.author.discriminator} has sent in a report!`)
                .addField('Report:', `${args.slice(1).join(" ")}`)
                .addField('Server:', `${message.guild.name} (${message.guild.id})`)
                .setThumbnail(client.user.avatarURL)

            client.channels.find("id", `397704312815484938`).sendEmbed(embed1)
            return
        }

        if (command === "suggest") {
            if (!reason1) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Empty message!', "You must input a suggestion! You cannot leave it blank.")

                message.channel.sendEmbed(embed)
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Suggestion sent!', "Thank you for your feedback.")

            message.channel.sendEmbed(embed);
            const embed1 = new Discord.RichEmbed()
                .setTimestamp()
                .setColor(3447003)
                .addField('New Feedback!', `${message.author.username}#${message.author.discriminator} has sent in a suggestion!`)
                .addField('Suggestion:', `${reason1}`)
                .addField('Server:', `${message.guild.name} (${message.guild.id})`)
                .setThumbnail(client.user.avatarURL)

            client.channels.find("id", `408276356497932309`).sendEmbed(embed1)
            return
        }

        if (command === "request") {
            sql.get(`SELECT * FROM time WHERE userId ="${message.author.id}"`).then(row => {
                if (row.date !== myDate) {
                    sql.run(`UPDATE time SET amount = 0 WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE time SET date = "0000-00-00" WHERE userId = ${message.author.id}`);
                }
                if (row.amount === 4) {
                    const embed = new Discord.RichEmbed()
                        .setColor("#ff0000")
                        .addField('Daily Max Reached!', "You have used up all 3 of your daily station suggestions, please wait until tomorrow to use this command again.")
                        .setFooter(`Command was used on ${row.date}. Today is ${myDate}`)

                    message.channel.sendEmbed(embed)
                    return
                }
                if (!args.slice(1).join(" ")) {
                    const embed = new Discord.RichEmbed()
                        .setColor("#ff0000")
                        .addField('Empty message!', "You must input a radio station you want to request to be added in! You cannot leave it blank.")

                    message.channel.sendEmbed(embed)
                    return
                }
                if (row.amount >= 0 && row.amount <= 4 && row.date === "0000-00-00") {
                    sql.run(`UPDATE time SET date = "${myDate}" WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE time SET amount = ${row.amount + 1} WHERE userId = ${message.author.id}`);
                    const embed = new Discord.RichEmbed()
                        .setColor("#68ca55")
                        .addField('Suggestion sent!', "That radio station will be considered.")
                        .setFooter(`Used ${row.amount}/3 daily suggestions.`)

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
                if (row.amount >= 0 && row.amount <= 4) {
                    sql.run(`UPDATE time SET amount = ${row.amount + 1} WHERE userId = ${message.author.id}`);
                    const embed = new Discord.RichEmbed()
                        .setColor("#68ca55")
                        .addField('Suggestion sent!', "That radio station will be considered.")
                        .setFooter(`Used ${row.amount}/3 daily suggestions.`)

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
            });
        }

        if (command === "list") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Radio Station List:', '`1`: AnimeNexus')
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
                    .addField('Success!', "Now playing AnimeNexus in " + message.member.voiceChannel)

                message.channel.sendEmbed(embed);
                const member1 = message.guild.member(client.user);
                if (member1 && !member1.deaf) member1.setDeaf(true);
                message.member.voiceChannel.join().then(connection => {
                    require('http').get("http://radio.animenexus.mx:8000/animenexus", (res) => {
                        connection.playStream(res);
                    })
                })
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#ff0000")
                .addField('Error!', "Radio does not exist!")

            message.channel.sendEmbed(embed)
        }

        if (command === "link") {
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
                    .addField('Error!', "No URL inputted!")

                message.channel.sendEmbed(embed)
                return
            }
            if (message.content.match(/http/i)) {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "Now playing your inputted radio station in " + message.member.voiceChannel + "\nIf you can't hear anything after a while it could be because the link was invalid")

                message.channel.sendEmbed(embed);
                const member1 = message.guild.member(client.user);
                if (member1 && !member1.deaf) member1.setDeaf(true);
                message.member.voiceChannel.join().then(connection => {
                    require('http').get(args[1], (res) => {
                        connection.playStream(res);
                    })
                })
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#ff0000")
                .addField('Error!', "Inputted URL did not contain http at the start!")

            message.channel.sendEmbed(embed)
            return
        }

        if (command === "leave") {
            if (message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "Voice channel successfully left!")

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.leave();
                return
            }
            else {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "You are currently not in a voice channel!")

                message.channel.sendEmbed(embed)
                return
            }
        }

        if (command === "volume") {
            const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
            if (voiceConnection === null) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Currently not in a voice channel!")

                message.channel.sendEmbed(embed)
                return
            }

            // Get the dispatcher
            const dispatcher = voiceConnection.player.dispatcher;

            if (args[1] > 200 || args[1] < 0) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Volume out of range! Must be 0-200!")

                message.channel.sendEmbed(embed)
                return
            }

            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Success!', `Volume set to \`${args[1]}\``)

            message.channel.sendEmbed(embed);
            dispatcher.setVolume((args[1] / 100));
        }

        if (command === "help") {
            if (args[1] === null || args[1] === "") {
                const embed = new Discord.RichEmbed()
                    .setColor(3447003)
                    .addField('Help Categories:', '`1.` Music Commands\n\
`2.` Miscellaneous\n\
`3.` Support Commands\n\
Do `help <number>` to select a category')
                    .setThumbnail(client.user.avatarURL)

                message.channel.sendEmbed(embed)
                return
            }
            if (args[1] === "1") {
                const page1 = new Discord.RichEmbed()
                    .setColor(3447003)
                    .setTitle("Music Commands")
                    .setDescription('`play <radio number>`: Plays a radio station.\n\
`link <radio url>`: Plays the radio station through its url, link must be http and something like "<http://88.198.69.145:8722/stream>"\n\
`leave`: Make the bot leave the channel.\n\
`list`: Lists the possible radio stations to be played.\n\
`volume <0-200>`: Set\'s the volume for the bot.\n')
                    .setFooter("You must have the `AnimeDJ` role to use these commands")

                message.channel.sendEmbed(page1)
                return
            }
            if (args[1] === "2") {
                const page2 = new Discord.RichEmbed()
                    .setColor(3447003)
                    .setTitle("Miscellaneous")
                    .setDescription('`help`: Displays all help categories.\n\
`donate`: Grab the donate link.\n\
`donators`: Sends a list of people who helped support Anime Radio Club through donations.\n\
`ping`: Pong!\n\
`stats`: Check Anime Radio Club\'s stats.\n\
`setprefix`: Set the prefix for your guild.\n\
`restart`: Restart the bot (Only for bot owner).\n')

                message.channel.sendEmbed(page2)
                return
            }
            if (args[1] === "3") {
                const page3 = new Discord.RichEmbed()
                    .setColor(3447003)
                    .setTitle("Support Commands")
                    .setDescription('`invite`: Grab the invite links for the bot.\n\
`website`: Grab the website and github link for the bot.\n\
`updates`: Displays the update notes so you know what\'s new in this version of the bot.\n\
`report`: Report a bug or something, not that you\'d know if that command was a bug.\n\
`request`: Request a suggestion for a radio station to be added in. (Limited to using this command 3 times a day).\n\
`suggest`: Suggest a feature or command you\'d like to see on the bot.')

                message.channel.sendEmbed(page3)
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Help Categories:', '`1.` Music Commands\n\
`2.` Miscellaneous\n\
`3.` Support Commands\n\
Do `help <number>` to select a category')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

    });
});

client.login(config.token);
