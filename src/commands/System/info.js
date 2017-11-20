exports.run = async (client, msg) => {
  const information = [
    "Komada is a 'plug-and-play' framework built on top of the Discord.js library.",
    "Most of the code is modularized, which allows developers to edit Komada to suit their needs.",
    "",
    "Some features of Komada include:",
    "• 🐇💨 Fast loading times with ES8 support (`async`/`await`)",
    "• 🎚🎛 Per-server settings that can be extended with your own fields",
    "• 💬 Customizable command system with automated usage parsing and the ability to reload commands and download new modules on-the-fly",
    "• 👀 \"Monitors\", which can watch messages and act on them, like a normal message event (for swear filters, spam protection, etc.)",
    "• ⛔ \"Inhibitors\", which can prevent commands from running based on a set of parameters (for permissions, blacklists, etc.)",
    "• 🗄 \"Providers\", which standardize and simplify usage of outside databases of your choosing (not yet documented)",
    "• ✅ \"Finalizers\", which run on messages after a successful command",
    "• ➕ \"Extendables\", which passively add properties or methods to existing Discord.js or Komada classes",
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
