const options = {
  max: 1,
  time: 30000,
  errors: ["time"],
};

module.exports = async (client, msg, cmd, args, error) => {
  if (cmd.rejected === true) return;
  const permLvl = await client.funcs.permissionLevel(client, msg.author, msg.guild).catch(err => client.funcs.log(err, "error"));
  if (cmd.conf.permLevel > permLvl) return msg.channel.sendCode("", "You do not have enough permission to use this command.").catch(err => client.funcs.log(err, "error"));
  const message = await msg.channel.sendMessage(`<@!${msg.member.id}> | **${error}** | You have **30** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`).catch(err => client.funcs.log(err, "error"));
  const param = await msg.channel.awaitMessages(response => response.member.id === msg.author.id && response.id !== message.id, options).catch(err => client.funcs.log(err, "error"));
  message.delete();
  if (param.first().content.toLowerCase() === "abort") return "Aborted";
  args.push(param.first().content);
  client.funcs.runCommandInhibitors(client, msg, cmd, args)
  .then(params => cmd.run(client, msg, params))
  .catch((reason) => {
    if (reason) {
      if (reason instanceof Promise) return;
      if (reason.stack) client.funcs.log(reason.stack, "error");
      msg.channel.sendCode("", reason).catch(console.error);
    }
  });
};
