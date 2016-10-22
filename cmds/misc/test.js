exports.run = (client, msg) => {
  client.funcs.log("Testing Log");
  client.funcs.log("Testing Debug", "debug");
  client.funcs.log("Testing Warn", "warn");
  client.funcs.log("Testing Error", "error");
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
