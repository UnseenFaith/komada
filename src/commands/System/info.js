exports.run = async (client, msg) => {
  const information = [
    "Komada is a 'plug-and-play' framework built on top of the Discord.js library.",
    "Most of the code is modularized, which allows developers to edit Komada to suit their needs.",
    "",
    "Some features of Komada include:",
    "• 🐇💨 Fast loading times with ES2017 support (`async`/`await`)",
    "• 🎚🎛 Per-server settings that can be extended with your own fields",
    "• 💬 Customizable command system with automated parameter resolving and the ability to reload commands and download new modules on-the-fly",
    "• 👀 \"Monitors\", which can watch messages and edits (for swear filters, spam protection, etc.)",
    "• ⛔ \"Inhibitors\", which can prevent commands from running based on any condition you wish to apply (for permissions, blacklists, etc.)",
    "• 🗄 \"Providers\", which simplify usage of any database of your choosing",
    "• ✅ \"Finalizers\", which run after successful commands (for logging, collecting stats, cleaning up responses, etc.)",
    "• ➕ \"Extendables\", which passively add methods, getters/setters, or static properties to existing Discord.js or Komada classes",
    "• 🇫 Internal \"Functions\", which allow you to use functions anywhere you have access to a client variable",
    "",
    "We hope to be a 100% customizable framework that can cater to all audiences. We do frequent updates and bugfixes when available.",
    "If you're interested in us, check us out at https://komada.js.org",
  ];
  return msg.sendMessage(information);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["details", "what"],
  permLevel: 0,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "info",
  description: "Provides some information about this bot.",
  usage: "",
  usageDelim: "",
};
