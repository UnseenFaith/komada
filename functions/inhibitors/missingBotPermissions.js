let config = require("../../config.json").commandInhibitors;

if (config === undefined) config = [];

exports.conf = {
  enabled: config.includes("missingBotPermissions"),
  spamProtection: false
};

exports.run = (bot, msg, cmd) => {
  return new Promise ((resolve, reject) => {

    let missing = [];
    if (msg.channel.type === "text") {
      missing = msg.channel.permissionsFor(bot.user).missingPermissions(cmd.conf.botPerms);
    } else {
      let impliedPermissions = bot.functions.core.impliedPermissions();
      cmd.conf.botPerms.forEach(perm => {
        if (!impliedPermissions[perm]) missing.push(perm);
      });
    }
    if (missing.length > 0) {
      reject(`Insufficient permissions, missing: **${bot.functions.core.toTitleCase(missing.join(", ").split("_").join(" "))}**`);
    } else {
      resolve();
    }
  });
};
