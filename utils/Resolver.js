/* eslint-disable class-methods-use-this */
const URL = require("url");
const Discord = require("discord.js");

class Resolver {
  constructor(client) {
    this.client = client;
  }

  resolveUser(user) {
    if (user instanceof Discord.User) return user;
    if (user instanceof Discord.GuildMember) return user.user;
    if (user instanceof String) {
      if (/^<@!?\d+>$/.test(user)) user = /^<@!?\d+>$/.exec(user)[0];
      return this.client.users.get(user) || null;
    }
    return null;
  }

  async resolveMember(guild, member) {
    if (member instanceof Discord.GuildMember) return member;
    if (member instanceof String) {
      if (/^<@!?\d+>$/.test(member)) member = /^<@!?\d+>$/.exec(member)[0];
      if (!guild.members.has(member)) {
        try {
          await guild.fetchMember(member);
        } catch (err) {
          return null;
        }
        return guild.members.get(member);
      }
      return guild.members.get(member);
    }
    return null;
  }

  resolveRole(guild, role) {
    if (role instanceof Discord.Role) return role;
    if (role instanceof String) {
      if (/^&\d+>$/.test(role)) role = /^<@&\d+>$/.exec(role)[0];
      return guild.roles.get(role) || null;
    }
    return null;
  }

  resolveChannel(channel) {
    if (channel instanceof Discord.Channel) return channel;
    if (channel instanceof String) {
      if (/^<#\d+>$/.test(channel)) channel = /^<#\d+>$/.exec(channel)[0];
      return this.client.channels.get(channel) || null;
    }
    return null;
  }

  resolveGuild(guild) {
    if (guild instanceof Discord.Guild) return guild;
    if (guild instanceof String) return this.client.guilds.get(/^\d+/.exec(guild)[0]) || null;
    return null;
  }

  resolveBoolean(boolean) {
    if (boolean instanceof Boolean) return boolean;
    if ([1, "true", "+", "t", "yes", "y"].includes(boolean)) return true;
    if ([0, "false", "-", "f", "no", "n"].includes(boolean)) return false;
    return null;
  }

  resolveString(string) {
    if (string instanceof String) return true;
    return String(string);
  }

  resolveInteger(integer) {
    integer = parseInt(integer);
    if (Number.isInteger(integer)) return integer;
    return null;
  }

  resolveNumber(number) {
    number = parseFloat(number);
    if (!isNaN(number)) return number;
    return null;
  }

  resolveURL(url) {
    const res = URL.parse(url);
    if (res.protocol && res.hostname) return url;
    return null;
  }
}

module.exports = Resolver;
