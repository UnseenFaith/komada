const { inspect } = require("util");
const { MessageAttachment } = require("discord.js");

/* eslint-disable no-eval, consistent-return */
exports.run = async (client, msg, [code]) => {
  try {
    let evaled = eval(code);
    if (evaled instanceof Promise) evaled = await evaled;
    if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 0 });
    const output = client.funcs.clean(client, evaled);
    if (output.length > 1992) {
      msg.channel.send(new MessageAttachment(Buffer.from(output), "output.txt"));
    }
    return msg.sendCode("js", output);
  } catch (err) {
    msg.sendMessage(`\`ERROR\` \`\`\`js\n${client.funcs.clean(client, err)}\n\`\`\``);
    if (err.stack) client.emit("error", err.stack);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["ev"],
  permLevel: 10,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "eval",
  description: "Evaluates arbitrary Javascript. Reserved for bot owner.",
  usage: "<expression:str>",
  usageDelim: "",
};
