![ANIMERADIO.club](http://i.imgur.com/hKeinVM.jpg)

# Official ANIMERADIO.club Discord Bot
The official Anime Radio Club Discord bot!!! Made with Discord.js
# Usage
After you've added the bot to your server, join a voice channel and type `>join` to bind the bot to that channel. You have to have the "Manage server" permission to use this command.
# Command list
This list uses `>` as the prefix for each
* `>join`
Type this while in a voice channel to have the bot join that channel and start playing there. Limited to users with the "manage server" permission.
* `>leave`
Type this to get the bot to leave the voice channel. Once again, limited to users with the "manage server" permission.
* `>np`
Supposed to show currently playing song. (Work in progress)
* `>pfix [new prefix]`
Type this in case your server has a bot that already uses the `=` sign as their prefix. Requires "Manage Server" permission.
* `>help`
Shows a real basic usage help.

# Run it with your own custom Bot or something
* Clone the Git or Repo or whatnot
* Create a Discord OAuth application and bot account
* Rename/duplicate `config.json.example` to `config.json` and fill out the relevant information
* Install Discord JS using Node JS and the command `npm install discord.js`
* Make sure Discord JS is up to date
* Download [FFMPEG](https://ffmpeg.zeranoe.com/builds/)
* Take the files from the first folder which should be named "Bin" and put it in the same folder as the Bot
* Install Winston with `npm install winston`
* Install Common-Tags with `npm install common-tags`
* Run the bot with `node animeradioclub.js`

# Troubleshooting
* If you get an error regarding `Opus-Engine` just do `npm install opusscript` and all should be fine.
* If the bot stops playing music, check to see if the website says that there are at least 1 or more listeners and then use `>join`.
* If the bot still does not play any music, try `>leave` and then `>join`.

# Extra goodness
Join our [Discord](https://discord.gg/WCxHjFX) channel or [Invite](https://discordapp.com/oauth2/authorize?client_id=273299834470006786&scope=bot&permissions=36702208) our bot to your server!
