const Discord = require("discord.js");

const DMChannel = Discord.DMChannel;
const GroupDMChannel = Discord.GroupDMChannel;
const TextChannel = Discord.TextChannel;
const Message = Discord.Message;
const GuildMember = Discord.GuildMember;
const Guild = Discord.Guild;
const User = Discord.User;


class Extendables {
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

  get reactable() {
    if (!this.guild) return true;
    return this.readable && this.permissionsFor(this.guild.member(this.client.user)).hasPermission("ADD_REACTIONS");
  }

  get guildConf() {
    return this.client.configuration.get(this.guild);
  }

  get conf() {
    return this.client.configuration.get(this);
  }

  get permLevel() {
    if (!this.guild) return this.client.funcs.permissionLevel(this.client, this, true);
    return this.client.funcs.permissionLevel(this.client, this, false);
  }
}

const applyToClass = (structure, props) => {
  for (const prop of props) {
    Object.defineProperty(structure.prototype, prop, Object.getOwnPropertyDescriptor(Extendables.prototype, prop));
  }
};

applyToClass(GroupDMChannel, ["embedable", "postable", "attachable", "readable"]);
applyToClass(DMChannel, ["embedable", "postable", "attachable", "readable"]);
applyToClass(TextChannel, ["embedable", "postable", "attachable", "readable"]);
applyToClass(Message, ["guildConf", "reactable"]);
applyToClass(GuildMember, ["permLevel"]);
applyToClass(Guild, ["conf"]);
applyToClass(User, ["permLevel"]);