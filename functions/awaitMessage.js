const options = {
  max: 1,
  time: 30000,
  errors: ["time"],
};

module.exports = async (client, msg, cmd, args, error) => {
  const user = msg.member || msg.author;
  const permLvl = user.permLevel;
  if (cmd.conf.permLevel > permLvl) return msg.channel.sendCode("", "You do not have enough permission to use this command.").catch(err => client.emit("error", client.funcs.newError(err)));
  const message = await msg.channel.sendMessage(`<@!${msg.member.id}> | **${error}** | You have **30** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`).catch(err => client.emit("error", client.funcs.newError(err)));
  const param = await msg.channel.awaitMessages(response => response.member.id === msg.author.id && response.id !== message.id, options).catch(err => client.emit("error", client.funcs.newError(err)));
  message.delete();
  if (!param) return "Aborted";
  if (param.first().content.toLowerCase() === "abort") return "Aborted";
  args.push(param.first().content);
  try {
    const params = await client.funcs.usage.run(client, msg, cmd, args);
    cmd.run(client, msg, params);
  } catch (err) {
    if (err) {
      if (err.code === 1 && client.config.cmdPrompt) {
        client.funcs.awaitMessage(client, msg, cmd, err.args, err.message);
      }
    }
  }
};
