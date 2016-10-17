exports.run = (client, msg) => {
  console.log("Test Executed");
  msg.reply("Test Executed");
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "test",
  description: "This is a test command. What does it do? ",
  usage: "",
  usageDelim: ""
};
