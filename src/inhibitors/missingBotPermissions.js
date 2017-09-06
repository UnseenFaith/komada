const { Permissions } = require("discord.js");

const impliedPermissions = new Permissions([
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "SEND_TTS_MESSAGES",
  "EMBED_LINKS",
  "ATTACH_FILES",
  "READ_MESSAGE_HISTORY",
  "MENTION_EVERYONE",
  "USE_EXTERNAL_EMOJIS",
  "ADD_REACTIONS",
]);

exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 7,
};

exports.run = (client, msg, cmd) => {
  const missing = msg.channel.type === "text" ? msg.channel.permissionsFor(client.user).missing(cmd.conf.botPerms) : impliedPermissions.missing(cmd.conf.botPerms);
  if (missing.length > 0) {
    if (missing.includes("SEND_MESSAGES")) {
      client.emit("log", `[Channel: ${msg.channel.id}] Insufficient permissions, missing: **${client.funcs.toTitleCase(missing.join(", ").split("_").join(" "))}**`, "error");
      return true;
    }
    return `Insufficient permissions, missing: **${client.funcs.toTitleCase(missing.join(", ").split("_").join(" "))}**`;
  }
  return false;
};
