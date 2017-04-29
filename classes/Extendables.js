const Discord = require("discord.js");
const ReactionCollector = require("./ReactionCollector.js");

const DMChannel = Discord.DMChannel;
const GroupDMChannel = Discord.GroupDMChannel;
const TextChannel = Discord.TextChannel;
const Message = Discord.Message;
const Guild = Discord.Guild;

/* A List of Extendables that allows Komada to extend native Discord.js structures to be easier or more efficient when used in Komada */
class Extendables {

  /** TextBasedChannel Extendables - All of these apply to GroupDM, DM, and Guild Text Channels
    * <GroupDMChannel|DMChannel|TextChannel>.readable - Checks if a channel is readable by the client user -> returns {Boolean}
    * <GroupDMChannel|DMChannel|TextChannel>.embedable - Checks if a channel is embedable by the client user -> returns {Boolean}
    * <GroupDMChannel|DMChannel|TextChannel>.postable - Checks if a channel is postable (able to send messages) by the client user -> returns {Boolean}
    * <GroupDMChannel|DMChannel|TextChannel>.attachable - Checks if a channel is attachable (able to attach files) by the client user -> returns {Boolean}
    */
  get readable() {
    if (!this.guild) return true;
    return this.permissionsFor(this.guild.member(this.client.user)).hasPermission("READ_MESSAGES");
  }

  get embedable() {
    if (!this.guild) return true;
    return this.readable && this.postable && this.permissionsFor(this.guild.member(this.client.user)).hasPermission("EMBED_LINKS");
  }

  get postable() {
    if (!this.guild) return true;
    return this.readable && this.permissionsFor(this.guild.member(this.client.user)).hasPermission("SEND_MESSAGES");
  }

  get attachable() {
    if (!this.guild) return true;
    return this.readable && this.postable && this.permissionsFor(this.guild.member(this.client.user)).hasPermission("ATTACH_FILES");
  }

  /** Message Extendables - Apply to all messages
    * <Message>.reatable - Checks if a message is reactable by the client user -> returns a boolean.
    * <Message>.createCollector - Creates a ReactionCollector on the message. Takes the same filter and options as MessageCollectors -> returns {ReactionCollector}
    * <Message>.awaitReactions - Same as createCollector for messages, except returns a promise with the collection of reactions collected. -> returns {Collection<EmojiName, Reaction>}
    * <Message>.guildConf - Returns a guild configuration (or default if no guild) containing proper configuration settings. -> returns {Object}
	* <Message>.usableCommands - Returns a filtered collection of commands usable by the the author in the context the message was sent. -> returns {Collection<CommandName, Command>}
    */
  get reactable() {
    if (!this.guild) return true;
    return this.readable && this.permissionsFor(this.guild.member(this.client.user)).hasPermission("ADD_REACTIONS");
  }

  hasAtleastPermissionLevel(min) {
    return !!this.client.funcs.checkPerms(this.client, this, min);
  }

  createCollector(filter, options = {}) {
    return new ReactionCollector(this, filter, options);
  }

  send(content = "", options = {}) {
    return this.sendMessage(content, options);
  }

  sendMessage(content = "", options = {}) {
    const commandMessage = this.client.commandMessages.get(this.id);
    if (!options.embed) options.embed = null;
    if (commandMessage) {
      return commandMessage.response.edit(content, options);
    }
    return this.channel.send(content, options)
				.then((mes) => {
  if (mes.constructor.name === "Message") this.client.commandMessages.set(this.id, { trigger: this, response: mes });
  return mes;
});
  }

  sendEmbed(embed, content, options) {
    if (!options && typeof content === "object") {
      options = content;
      content = "";
    } else if (!options) {
      options = {};
    }
    return this.sendMessage(content, Object.assign(options, { embed }));
  }

  sendCode(lang, content, options = {}) {
    return this.sendMessage(content, Object.assign(options, { code: lang }));
  }

  awaitReactions(filter, options = {}) {
    return new Promise((resolve, reject) => {
      const collector = this.createCollector(filter, options);
      collector.on("end", (collection, reason) => {
        if (options.errors && options.errors.includes(reason)) {
          reject(collection);
        } else {
          resolve(collection);
        }
      });
    });
  }

  get guildConf() {
    return this.client.configuration.get(this.guild);
  }

  get usableCommands() {
    return this.client.commands.filter(command => !this.client.commandInhibitors.some((inhibitor) => {
      if (inhibitor.conf.enabled && !inhibitor.conf.spamProtection) return inhibitor.run(this.client, this, command);
      return false;
    }));
  }

  /** Guild Extendable - Applies to all Guilds
    * <Guild>.conf - Same as guildConf for message, but a different way of getting it -> returns {Object}
    */
  get conf() {
    return this.client.configuration.get(this);
  }

}

/* The backbone of this extendable file. Adds the properties in Arrays to their respected Structures */
const applyToClass = (structure, props) => {
  for (const prop of props) {
    Object.defineProperty(structure.prototype, prop, Object.getOwnPropertyDescriptor(Extendables.prototype, prop));
  }
};

applyToClass(GroupDMChannel, ["embedable", "postable", "attachable", "readable"]);
applyToClass(DMChannel, ["embedable", "postable", "attachable", "readable"]);
applyToClass(TextChannel, ["embedable", "postable", "attachable", "readable"]);
applyToClass(Message, ["hasAtleastPermissionLevel", "usableCommands", "guildConf", "reactable", "createCollector", "awaitReactions", "sendMessage", "sendEmbed", "sendCode", "send"]);
applyToClass(Guild, ["conf"]);
