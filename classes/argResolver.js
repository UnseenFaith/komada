const Resolver = require("./Resolver");

/* eslint-disable no-throw-literal, class-methods-use-this */
module.exports = class ArgResolver extends Resolver {

  async message(arg, currentUsage, possible, repeat, msg) {
    return this.msg(arg, currentUsage, possible, repeat, msg);
  }

  async msg(arg, currentUsage, possible, repeat, msg) {
    const message = await super.msg(arg, msg.channel);
    if (message) return message;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
  }

  async mention(arg, currentUsage, possible, repeat) {
    return this.user(arg, currentUsage, possible, repeat);
  }

  async user(arg, currentUsage, possible, repeat) {
    const user = await super.user(arg);
    if (user) return user;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
  }

  async member(arg, currentUsage, possible, repeat, msg) {
    const member = await super.member(arg, msg.guild);
    if (member) return member;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
  }

  async channel(arg, currentUsage, possible, repeat) {
    const channel = await super.channel(arg);
    if (channel) return channel;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a channel tag or valid channel id.`;
  }

  async guild(arg, currentUsage, possible, repeat) {
    const guild = await super.guild(arg);
    if (guild) return guild;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid guild id.`;
  }

  async role(arg, currentUsage, possible, repeat, msg) {
    const role = await super.role(arg, msg.guild);
    if (role) return role;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a role mention or role id.`;
  }

  async literal(arg, currentUsage, possible, repeat) {
    if (arg.toLowerCase() === currentUsage.possibles[possible].name.toLowerCase()) return arg.toLowerCase();
    if (currentUsage.type === "optional" && !repeat) return null;
    throw [
      `Your option did not litterally match the only possibility: (${currentUsage.possibles.map(poss => poss.name).join(", ")})`,
      "This is likely caused by a mistake in the usage string.",
    ].join("\n");
  }

  async bool(arg, currentUsage, possible, repeat) {
    return this.boolean(arg, currentUsage, possible, repeat);
  }

  async boolean(arg, currentUsage, possible, repeat) {
    const boolean = await super.boolean(arg);
    if (boolean !== null) return boolean;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be true or false.`;
  }

  async str(arg, currentUsage, possible, repeat) {
    return this.string(arg, currentUsage, possible, repeat);
  }

  async string(arg, currentUsage, possible, repeat) {
    const min = currentUsage.possibles[possible].min;
    const max = currentUsage.possibles[possible].max;
    if (min && max) {
      if (arg.length >= min && arg.length <= max) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      if (min === max) throw `${currentUsage.possibles[possible].name} must be exactly ${min} characters.`;
      throw `${currentUsage.possibles[possible].name} must be between ${min} and ${max} characters.`;
    } else if (min) {
      if (arg.length >= min) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be longer than ${min} characters.`;
    } else if (max) {
      if (arg.length <= max) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be shorter than ${max} characters.`;
    }
    return arg;
  }

  async int(arg, currentUsage, possible, repeat) {
    return this.integer(arg, currentUsage, possible, repeat);
  }

  async integer(arg, currentUsage, possible, repeat) {
    const min = currentUsage.possibles[possible].min;
    const max = currentUsage.possibles[possible].max;
    arg = await super.integer(arg);
    if (arg === null) {
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be an integer.`;
    } else if (min && max) {
      if (arg >= min && arg <= max) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      if (min === max) throw `${currentUsage.possibles[possible].name} must be exactly ${min}\nSo why didn't the dev use a literal?`;
      throw `${currentUsage.possibles[possible].name} must be between ${min} and ${max}.`;
    } else if (min) {
      if (arg >= min) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be greater than ${min}.`;
    } else if (max) {
      if (arg <= max) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be less than ${max}.`;
    }
    return arg;
  }

  async num(arg, currentUsage, possible, repeat) {
    return this.float(arg, currentUsage, possible, repeat);
  }

  async number(arg, currentUsage, possible, repeat) {
    return this.float(arg, currentUsage, possible, repeat);
  }

  async float(arg, currentUsage, possible, repeat) {
    const min = currentUsage.possibles[possible].min;
    const max = currentUsage.possibles[possible].max;
    arg = await super.float(arg);
    if (arg === null) {
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be a valid number.`;
    } else if (min && max) {
      if (arg >= min && arg <= max) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      if (min === max) throw `${currentUsage.possibles[possible].name} must be exactly ${min}\nSo why didn't the dev use a literal?`;
      throw `${currentUsage.possibles[possible].name} must be between ${min} and ${max}.`;
    } else if (min) {
      if (arg >= min) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be greater than ${min}.`;
    } else if (max) {
      if (arg <= max) return arg;
      if (currentUsage.type === "optional" && !repeat) return null;
      throw `${currentUsage.possibles[possible].name} must be less than ${max}.`;
    }
    return arg;
  }

  async url(arg, currentUsage, possible, repeat) {
    const hyperlink = await super.url(arg);
    if (hyperlink !== null) return hyperlink;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid url.`;
  }

};
