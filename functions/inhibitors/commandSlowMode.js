let config = require("../../config.json").commandInhibitors;

if (config === undefined) config = [];

const slowmode = new Map();
const ratelimit = 5000;

exports.conf = {
  enabled: config.includes("commandSlowMode")
};

exports.run = (bot, msg, cmd) => {
  return new Promise ((resolve, reject) => {
    // also available: msg.server.id , msg.author.id
    let slowmode_level = msg.channel.id;
    let entry = slowmode.get(slowmode_level);
    if(!entry)
      slowmode.set(slowmode_level, true);

    setTimeout(()=> {
      slowmode.delete(slowmode_level);
    }, ratelimit);

    if (entry) reject();
    else resolve();
  });
};
