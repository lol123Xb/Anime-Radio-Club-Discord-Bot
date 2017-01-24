![ANIMERADIO.club](https://lh3.googleusercontent.com/zBEKPHMupr8omneGhfGgs7vjFh6WaHyW-zOfkEP988mFhM5CkZ1lWaD8Fbr8kiS5QuKoaZyGc0vLSGM=w1920-h950-rw)

# Official ANIMERADIO.club Discord Bot
The official Anime Radio Club Discord bot!!! Made with Discord.js
# Usage
After you've added the bot to your server, join a voice channel and type `=join` to bind the bot to that channel. You have to have the "Manage server" permission to use this command.
# Command list
This list uses `=` as the prefix for each
* `=join`
Type this while in a voice channel to have the bot join that channel and start playing there. Limited to users with the "manage server" permission.
* `=leave`
Type this to get the bot to leave the voice channel. Once again, limited to users with the "manage server" permission.
* `=np`
Supposed to show currently playing song. (Work in progress)
* `=help`
Shows a real basic usage help.

# Run it with your own custom Bot or something
* Clone the Git or Repo or whatnot
* Create a Discord OAuth application and bot account
* Rename/duplicate `config-sample.json` to `config.json` and fill out the relevant information
* Install Discord JS using Node JS and the command `npm install discord.js`
* Make sure Discord JS is up to date
* Download [FFMPEG](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20170123-e371f03-win64-static.zip)
* Take the files from the first folder which should be named "Bin" and put it in the same folder as the Bot
* Run the bot with `node animeradioclub.js`

# Troubleshooting
* If you get an error regarding `Opus-Engine` just do `npm install opusscript` and all should be fine.
