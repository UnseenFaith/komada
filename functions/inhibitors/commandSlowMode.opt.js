const slowmode = new Map();
const timers = [];
const ratelimit = 1250;

exports.conf = {
  enabled: true,
  spamProtection: true
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    // also available: msg.server.id , msg.channel.id
    let slowmode_level = msg.author.id;
    let entry = slowmode.get(slowmode_level);
    if (!entry)
      slowmode.set(slowmode_level, true);
    if (timers[slowmode_level]) clearTimeout(timers[slowmode_level]);
    timers[slowmode_level] = setTimeout(() => {
      slowmode.delete(slowmode_level);
    }, ratelimit);

    if (entry) reject();
    else resolve();
  });
};
