const Discord = require("discord.js");

const DMChannel = Discord.DMChannel;
const GroupDMChannel = Discord.GroupDMChannel;
const TextChannel = Discord.TextChannel;
const Message = Discord.Message;
const GuildMember = Discord.GuildMember;
const Guild = Discord.Guild;
const User = Discord.User;


class Extendables {
  get embedable() {
    if (!this.guild) return true;
    return this.permissionsFor(this.guild.member(this.client.user.id)).hasPermission("EMBED_LINKS");
  }

  get postable() {
    if (!this.guild) return true;
    return this.permissionsFor(this.guild.member(this.client.user.id)).hasPermission("SEND_MESSAGES");
  }

  get attachable() {
    if (!this.guild) return true;
    return this.permissionsFor(this.guild.member(this.client.user.id)).hasPermission("ATTACH_FILES");
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

applyToClass(GroupDMChannel, ["embedable", "postable", "attachable"]);
applyToClass(DMChannel, ["embedable", "postable", "attachable"]);
applyToClass(TextChannel, ["embedable", "postable", "attachable"]);
applyToClass(Message, ["guildConf"]);
applyToClass(GuildMember, ["permLevel"]);
applyToClass(Guild, ["conf"]);
applyToClass(User, ["permLevel"]);
