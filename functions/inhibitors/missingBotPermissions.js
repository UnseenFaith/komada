let config = require("../../config.json").commandInhibitors;

if (config === undefined) config = [];

exports.conf = {
  enabled: config.includes("missingBotPermissions"),
  spamProtection: false
};

exports.run = (client, msg, cmd) => {
  return new Promise ((resolve, reject) => {

    let missing = [];
    if (msg.channel.type === "text") {
      missing = msg.channel.permissionsFor(client.user).missingPermissions(cmd.conf.botPerms);
    } else {
      let impliedPermissions = client.functions.core.impliedPermissions();
      cmd.conf.botPerms.forEach(perm => {
        if (!impliedPermissions[perm]) missing.push(perm);
      });
    }
    if (missing.length > 0) {
      reject(`Insufficient permissions, missing: **${client.functions.core.toTitleCase(missing.join(", ").split("_").join(" "))}**`);
    } else {
      resolve();
    }
  });
};
