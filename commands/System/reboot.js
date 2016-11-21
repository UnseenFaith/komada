exports.run = (client, msg) => {
  const collector = msg.channel.createCollector(m => m.author === msg.author, {
    time: 10000,
  });
  msg.channel.sendMessage("are you sure?");
  collector.on("message", (m) => {
    if (m.content === "no") collector.stop("aborted");
    if (m.content === "yes") collector.stop("success");
  });
  collector.on("end", (collected, reason) => {
    if (reason === "time") return msg.channel.sendMessage("The prompt timed out...");
    if (reason === "aborted") return msg.channel.sendMessage("The reboot has been aborted");
    if (reason === "success") {
      msg.channel.sendMessage("Rebooting...")
        .then(() => {
          process.exit();
        })
        .catch((e) => {
          console.error(e);
        });
    }
    return true;
  });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "reboot",
  description: "reboots the bot.",
  usage: "",
  usageDelim: "",
};
