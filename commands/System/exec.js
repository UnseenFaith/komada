const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

exports.run = async (client, msg, [input]) => {
  const result = await exec(input);

  const output = result.stdout ? `**\`OUTPUT\`**${"```"}\n${result.stdout}\n${"```"}` : "";
  const outerr = result.stderr ? `**\`ERROR\`**${"```"}\n${result.stderr}\n${"```"}` : "";
  return msg.send([output, outerr].join("\n"));
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "exec",
  description: "Execute Order 66.",
  usage: "<expression:str>",
  usageDelim: "",
  extendedHelp: "",
};
