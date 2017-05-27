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
    if (user.constructor.name === "String") {
      // eslint-disable-next-line no-nested-ternary
      return regex.userOrMember.test(user) ?
      this.client.user.bot ? this.client.fetchUser(regex.userOrMember.exec(user)[1]).catch(() => null) : this.client.users.get(regex.userOrMember.exec(user)[1]) :
      null;
    }
    return null;
  }

  async member(member, guild) {
    if (member instanceof Discord.Member) return member;
    if (member.constructor.name === "String") return regex.userOrMember.test(member) ? guild.fetchMember(regex.userOrMember.exec(member)[1]).catch(() => null) : null;
    return null;
  }

  async channel(channel) {
    if (channel instanceof Discord.Channel) return channel;
    if (channel.constructor.name === "String") return regex.channel.test(channel) ? this.client.channels.get(regex.channel.exec(channel)[1]) : null;
    return null;
  }

  async guild(guild) {
    if (guild instanceof Discord.Channel) return guild;
    if (guild.constructor.name === "String") return regex.snowflake.test(guild) ? this.client.guilds.get(guild) : null;
    return null;
  }

  async role(role, guild) {
    if (role instanceof Discord.Channel) return role;
    if (role instanceof Discord.Role) return role;
    if (role.constructor.name === "String") return regex.role.test(role) ? guild.roles.get(regex.role.exec(role)[1]) : null;
    return null;
  }

  async boolean(bool) {
    if (bool instanceof Boolean) return bool;
    if (["1", "true", "+", "t", "yes"].includes(String(bool).toLowerCase())) return true;
    if (["0", "false", "-", "f", "no"].includes(String(bool).toLowerCase())) return false;
    return null;
  }

  async string(string) {
    if (string.constructor.name === "String") return string;
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
