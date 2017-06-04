const url = require("url");
const Discord = require("discord.js");

const regex = {
  userOrMember: new RegExp("^(?:<@!?)?(\\d{17,21})>?$"),
  channel: new RegExp("^(?:<#)?(\\d{17,21})>?$"),
  role: new RegExp("^(?:<@&)?(\\d{17,21})>?$"),
  snowflake: new RegExp("^(\\d{17,21})$"),
};


/* eslint-disable no-throw-literal, class-methods-use-this */
module.exports = class Resolver {

  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }

  async msg(message, channel) {
    if (message instanceof Discord.Message) return message;
    return regex.snowflake.test(message) ? channel.fetchMessage(message).catch(() => null) : undefined;
  }

  async user(user) {
    if (user instanceof Discord.User) return user;
    if (user instanceof Discord.Member) return user.user;
    if (typeof user === "string" && regex.userOrMember.test(user)) return this.client.user.bot ? this.client.fetchUser(regex.userOrMember.exec(user)[1]).catch(() => null) : this.client.users.get(regex.userOrMember.exec(user)[1]);
    return null;
  }

  async member(member, guild) {
    if (member instanceof Discord.Member) return member;
    if (member instanceof Discord.User) return guild.fetchMember(member);
    if (typeof member === "string" && regex.userOrMember.test(member)) {
      const user = this.client.user.bot ? await this.client.fetchUser(regex.userOrMember.exec(member)[1]).catch(() => null) : this.client.users.get(regex.userOrMember.exec(member)[1]);
      if (user) return guild.fetchMember(user).catch(() => null);
    }
    return null;
  }

  async channel(channel) {
    if (channel instanceof Discord.Channel) return channel;
    if (typeof channel === "string" && regex.channel.test(channel)) return this.client.channels.get(regex.channel.exec(channel)[1]);
    return null;
  }

  async guild(guild) {
    if (guild instanceof Discord.Guild) return guild;
    if (typeof guild === "string" && regex.snowflake.test(guild)) return this.client.guilds.get(guild);
    return null;
  }

  async role(role, guild) {
    if (role instanceof Discord.Role) return role;
    if (typeof role === "string" && regex.role.test(role)) return guild.roles.get(regex.role.exec(role)[1]);
    return null;
  }

  async boolean(bool) {
    if (bool instanceof Boolean) return bool;
    if (["1", "true", "+", "t", "yes"].includes(String(bool).toLowerCase())) return true;
    if (["0", "false", "-", "f", "no"].includes(String(bool).toLowerCase())) return false;
    return null;
  }

  async string(string) {
    return String(string);
  }

  async integer(integer) {
    integer = parseInt(integer);
    if (Number.isInteger(integer)) return integer;
    return null;
  }

  async float(number) {
    number = parseFloat(number);
    if (!isNaN(number)) return number;
    return null;
  }

  async url(hyperlink) {
    const res = url.parse(hyperlink);
    if (res.protocol && res.hostname) return hyperlink;
    return null;
  }

};
