module.exports = (client, msg, cmd, args, error) => {
  client.funcs.permissionLevel(client, msg.author, msg.guild).then((permLvl) => {
    if (cmd.conf.permLevel > permLvl) return msg.channel.sendCode("", "You do not have enough permission to use this command.");
    msg.channel.sendMessage(`<@!${msg.member.id}> | **${error}** | You have **30** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`).then((message) => {
      msg.channel.awaitMessages(response => response.member.id === msg.author.id && response.id !== message.id, {
        max: 1,
        time: 30000,
        errors: ["time"],
      })
      .then((param) => {
        message.delete();
        if (param.first().content.toLowerCase() === "abort") return;
        args.push(param.first().content);
        client.funcs.runCommandInhibitors(client, msg, cmd, args)
        .then((params) => {
          cmd.run(client, msg, params);
        });
      })
      .catch((reason) => {
        if (reason) {
          if (reason.stack) client.funcs.log(reason.stack, "error");
          msg.channel.sendCode("", reason).catch(console.error);
        }
      })
      .catch(() => {
        msg.channel.sendMessage("No message was sent before the 30 second mark. Aborting command.");
      });
    });
  }).catch((err) => {
    console.error(err);
  });
};
