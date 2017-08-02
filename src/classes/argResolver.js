const Resolver = require("./Resolver");

/* eslint-disable no-throw-literal, class-methods-use-this */
/**
 * The resolver that is used for arguments.
 * @extends Resolver
 */
class ArgResolver extends Resolver {

  /**
   * Resolves a message
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @param {Message} msg The message that triggered the command
   * @returns {external:Message}
   */
  message(...args) {
    return this.msg(...args);
  }

  /**
   * Resolves a message
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @param {Message} msg The message that triggered the command
   * @returns {external:Message}
   */
  async msg(arg, currentUsage, possible, repeat, msg) {
    const message = await super.msg(arg, msg.channel);
    if (message) return message;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
  }

  messages(...args) {
    return this.msgs(...args);
  }

  async msgs(arg, currentUsage, possible, repeat, msg) {
    const messages = await super.messages(arg, msg.channel, currentUsage.possibles[possible].min);
    if (messages.size > 0) return messages;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
  }

  /**
   * Resolves a user
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {external:User}
   */
  mention(...args) {
    return this.user(...args);
  }

  /**
   * Resolves a user
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {external:User}
   */
  async user(arg, currentUsage, possible, repeat) {
    const user = await super.user(arg);
    if (user) return user;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
  }

  /**
   * Resolves a member
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @param {Message} msg The message that triggered the command
   * @returns {external:GuildMember}
   */
  async member(arg, currentUsage, possible, repeat, msg) {
    const member = await super.member(arg, msg.guild);
    if (member) return member;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
  }

  /**
   * Resolves a channel
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {external:Channel}
   */
  async channel(arg, currentUsage, possible, repeat) {
    const channel = await super.channel(arg);
    if (channel) return channel;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a channel tag or valid channel id.`;
  }

  /**
   * Resolves a guild
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {external:Guild}
   */
  async guild(arg, currentUsage, possible, repeat) {
    const guild = await super.guild(arg);
    if (guild) return guild;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid guild id.`;
  }

  /**
   * Resolves a role
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @param {Message} msg The message that triggered the command
   * @returns {external:Role}
   */
  async role(arg, currentUsage, possible, repeat, msg) {
    const role = await super.role(arg, msg.guild);
    if (role) return role;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a role mention or role id.`;
  }

  /**
   * Resolves a literal
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {string}
   */
  async literal(arg, currentUsage, possible, repeat) {
    if (arg.toLowerCase() === currentUsage.possibles[possible].name.toLowerCase()) return arg.toLowerCase();
    if (currentUsage.type === "optional" && !repeat) return null;
    throw [
      `Your option did not literally match the only possibility: (${currentUsage.possibles.map(poss => poss.name).join(", ")})`,
      "This is likely caused by a mistake in the usage string.",
    ].join("\n");
  }

  /**
   * Resolves a boolean
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {boolean}
   */
  bool(...args) {
    return this.boolean(...args);
  }

  /**
   * Resolves a boolean
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {boolean}
   */
  async boolean(arg, currentUsage, possible, repeat) {
    const boolean = await super.boolean(arg);
    if (boolean !== null) return boolean;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be true or false.`;
  }

  /**
   * Resolves a string
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {string}
   */
  str(...args) {
    return this.string(...args);
  }

  /**
   * Resolves a string
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {string}
   */
  async string(arg, currentUsage, possible, repeat) {
    const { min, max } = currentUsage.possibles[possible];
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

  /**
   * Resolves a integer
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {number}
   */
  int(...args) {
    return this.integer(...args);
  }

  /**
   * Resolves a integer
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {number}
   */
  async integer(arg, currentUsage, possible, repeat) {
    const { min, max } = currentUsage.possibles[possible];
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

  /**
   * Resolves a number
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {number}
   */
  num(...args) {
    return this.float(...args);
  }

  /**
   * Resolves a number
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {number}
   */
  number(...args) {
    return this.float(...args);
  }

  /**
   * Resolves a number
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {number}
   */
  async float(arg, currentUsage, possible, repeat) {
    const { min, max } = currentUsage.possibles[possible];
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

  /**
   * Resolves a hyperlink
   * @param {string} arg This arg
   * @param {Object} currentUsage This current usage
   * @param {number} possible This possible usage id
   * @param {boolean} repeat If it is a looping/repeating arg
   * @returns {string}
   */
  async url(arg, currentUsage, possible, repeat) {
    const hyperlink = await super.url(arg);
    if (hyperlink !== null) return hyperlink;
    if (currentUsage.type === "optional" && !repeat) return null;
    throw `${currentUsage.possibles[possible].name} must be a valid url.`;
  }

}

module.exports = ArgResolver;
