const Discord = require("discord.js");
const client = new Discord.Client();
var config = require("./config.json");
const request = require("request");

const version = "5.2"

let listeners = 0;

client.on('ready', () => {
  console.log("Anime Radio Club, rolling out!")
});

client.on("message", message => {
  if (message.channel.type === 'dm') return;
  if (message.channel.type !== 'text') return;

  if (message.author.bot) return;
  const prefix = ">";
  const args = message.content.split(" ");
  let command = args[0];
  command = command.slice(prefix.length)
  if (!message.content.startsWith(prefix)) return;
  var reason1 = args.slice(1).join(" ");

  if (command === "eval") {
    if (message.author.id === config.owner) {
      try {
        var output = eval(args.slice(1).join(" "))
        message.channel.send('**Output:** ' + output)
        return
      } catch (error) {
        message.channel.send('**Error:** ```' + error + '```')
        return
      }
    } else {
      message.channel.send("I'm sorry, only the bot creator can use this command!")
    }
  }

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
    } else {
      message.channel.send("I'm sorry, only the bot creator can use this command!")
    }
  }

  if (command === "updates") {
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .setAuthor('Update Notes', client.user.avatarURL)
      .addField(`What's new in Version ${version}:`, `- Updated invite link
                        - Removed commands that would target channels in the support server`)
      .addField(`What was new in Previous Version:`, `- Removed Italian to see if it'll help the bot actually run
                        - Removed limit for requesting
                        - Updated Discord.js to v12 so was forced to update all code`)

    message.channel.send(embed)
  }

  if (command === "donators") {
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .setAuthor('Donators', client.user.avatarURL)
      .setDescription("Buttons#3961 - $5")
      .setFooter("Awesome list of people")

    message.channel.send(embed)
  }

  if (command === "play") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField('Error!', "You must be in a Voice channel to use this command!")

      message.channel.send(embed)
      return
    }
    if (!args[1]) {
      const embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField('Error!', "No radio was selected!")

      message.channel.send(embed)
      return
    }
    if (args[1] === "1") {
      const embed = new Discord.MessageEmbed()
        .setColor("#68ca55")
        .addField('Success!', "Now playing AnimeNexus in " + message.member.voice.channel)

      message.channel.send(embed);
      message.member.voice.channel.join().then(connection => {
        require('http').get("http://radio.animenexus.mx:8000/animenexus", (res) => {
          connection.play(res).on('error', err => {
            client.logger.error(err);
            connection.play(res)
          })
        })
      })
      return
    }
    const embed = new Discord.MessageEmbed()
      .setColor("#ff0000")
      .addField('Error!', "Radio does not exist!")

    message.channel.send(embed)
  }

  if (command === "invite") {
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .addField('Invite me to your server!', '[Click Here](https://discord.com/api/oauth2/authorize?client_id=868709887310434415&permissions=8&scope=bot)')
      .addField('Get support!', '[Click Here](https://discord.gg/WCxHjFX)')
      .setThumbnail(client.user.avatarURL)

    message.channel.send(embed);
  }

  if (command === "website") {
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .addField('View our Website!', '[Click Here](http://animeradioclub.com/)')
      .addField('View our Source code on Github!', '[Click Here](https://github.com/lol123Xb/Anime-Radio-Club-Discord-Bot)')
      .setThumbnail(client.user.avatarURL)

    message.channel.send(embed);
  }

  if (command === "donate") {
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .addField('Donate Paypal', '[Click Here](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=6VT2S8CMDZH2L&lc=AU&item_name=AnimeRadioClub&item_number=arc&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)', true)
      .setThumbnail(client.user.avatarURL)
      .setFooter("After donating, contact me directly, Felix#1330, to get yourself on the list of donators")

    message.channel.send(embed);
  }

  if (command === "stats") {
    const game = client.user.presence.game || {};
    const embed = new Discord.MessageEmbed()
      .setTitle('Anime Radio Club')
      .setAuthor('Felix#1330', 'https://scontent.fper5-1.fna.fbcdn.net/v/t1.0-9/s960x960/73068604_2587656247939444_4950220292795400192_o.jpg')
      .setColor(3447003)
      .addField(':desktop: Servers', `${client.guilds.cache.size}`, true)
      .addField(':thinking: RAM usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
      .addField(':floppy_disk: Version', version, true)
      .addField(`:musical_note:  Listeners:`, `${listeners}`, true)
      .setThumbnail(client.user.avatarURL)

    message.channel.send(embed)
  }

  if (command === "list") {
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .addField('Radio Station List:', '`1`: AnimeNexus\n')
      .setFooter("Request a radio station to be added with the `request` command.")
      .setThumbnail(client.user.avatarURL)

    message.channel.send(embed)
  }

  if (command === "link") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField('Error!', "You must be in a Voice channel to use this command!")

      message.channel.send(embed)
      return
    }
    if (!args[1]) {
      const embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField('Error!', "No URL inputted!")

      message.channel.send(embed)
      return
    }
    if (message.content.match(/http/i)) {
      const embed = new Discord.MessageEmbed()
        .setColor("#68ca55")
        .addField('Success!', "Now playing your inputted radio station in " + message.member.voice.channel + "\nIf you can't hear anything after a while it could be because the link was invalid")

      message.channel.send(embed);
      const member1 = message.guild.member(client.user);
      message.member.voice.channel.join().then(connection => {
        require('http').get(args[1], (res) => {
          connection.play(res);
        })
      return
    }
    const embed = new Discord.MessageEmbed()
      .setColor("#ff0000")
      .addField('Error!', "Inputted URL did not contain http at the start!")

    message.channel.send(embed)
    return
  }

  if (command === "leave") {
    if (message.member.voice.channel) {
      const embed = new Discord.MessageEmbed()
        .setColor("#68ca55")
        .addField('Success!', "Voice channel successfully left!")

      message.channel.send(embed);
      message.member.voice.channel.leave();
      return
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField('Error!', "You are currently not in a voice channel!")

      message.channel.send(embed)
      return
    }
  }

  if (command === "help") {
    if (args[1] === null || args[1] === "") {
      const embed = new Discord.MessageEmbed()
        .setColor(3447003)
        .addField('Help Categories:', '`1.` Music Commands\n\
`2.` Miscellaneous\n\
`3.` Support Commands\n\
Do `help <number>` to select a category')
        .setThumbnail(client.user.avatarURL)

      message.channel.send(embed)
      return
    }
    if (args[1] === "1") {
      const page1 = new Discord.MessageEmbed()
        .setColor(3447003)
        .setTitle("Music Commands")
        .setDescription('`play <radio number>`: Plays a radio station.\n\
`link <radio url>`: Plays the radio station through its url, link must be http and something like "<http://88.198.69.145:8722/stream>"\n\
`leave`: Make the bot leave the channel.\n\
`list`: Lists the possible radio stations to be played.\n')

      message.channel.send(page1)
      return
    }
    if (args[1] === "2") {
      const page2 = new Discord.MessageEmbed()
        .setColor(3447003)
        .setTitle("Miscellaneous")
        .setDescription('`help`: Displays all help categories.\n\
`donate`: Grab the donate link.\n\
`donators`: Sends a list of people who helped support Anime Radio Club through donations.\n\
`ping`: Pong!\n\
`stats`: Check Anime Radio Club\'s stats.\n\
`setprefix`: Set the prefix for your guild.\n\
`restart`: Restart the bot (Only for bot owner).\n')

      message.channel.send(page2)
      return
    }
    if (args[1] === "3") {
      const page3 = new Discord.MessageEmbed()
        .setColor(3447003)
        .setTitle("Support Commands")
        .setDescription('`invite`: Grab the invite links for the bot.\n\
`website`: Grab the website and github link for the bot.\n\
`updates`: Displays the update notes so you know what\'s new in this version of the bot.')

      message.channel.send(page3)
      return
    }
    const embed = new Discord.MessageEmbed()
      .setColor(3447003)
      .addField('Help Categories:', '`1.` Music Commands\n\
`2.` Miscellaneous\n\
`3.` Support Commands\n\
Do `help <number>` to select a category')
      .setThumbnail(client.user.avatarURL)

    message.channel.send(embed)
  }
});

client.login(config.token);
