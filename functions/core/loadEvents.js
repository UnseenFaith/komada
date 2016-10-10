const fs = require("fs");
// var because const won't work :/
var events = require("discord.js/src/util/Constants.js").Events;
events = Object.keys(events).map(k => events[k]);

module.exports = bot => {
  fs.readdir("./functions/events", (err, files) => {
    if(err) console.error(err);
    files.forEach(f=> {
      let name = f.split(".")[0];
      bot.on(name, (...args) => require(`../events/${f}`).run(bot, ...args));
    });
    bot.log(`Loaded ${files.length} events`);
  });
};
