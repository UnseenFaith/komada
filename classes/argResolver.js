const url = require("url");

module.exports = class ArgResolver {

  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }

  async message(arg, currentUsage, possible, repeat, msg) {
    return this.msg(arg, currentUsage, possible, repeat, msg);
  }

  async msg(arg, currentUsage, possible, repeat, msg) {
    if (/^\d+$/.test(arg)) {
      if (this.client.config.selfbot) {
        const mes = await msg.channel.fetchMessages({ around: arg }).catch(() => {
          if (currentUsage.type === "optional" && !repeat) {
            return null;
          }
          throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
        });
        return mes.filter(ele => ele.id === arg).first();
      }
      const mes = await msg.channel.fetchMessage(arg).catch(() => {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
      });
      return mes;
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
  }

  async user(arg, currentUsage, possible, repeat) {
    if ((/^<@!?\d+>$/.test(arg) && this.client.users.has(/\d+/.exec(arg)[0])) || (/\d+/.test(arg) && this.client.users.has(/\d+/.exec(arg)[0]) && arg.length > 5)) {
      return this.client.users.get(/\d+/.exec(arg)[0]);
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
  }

  async mention(arg, currentUsage, possible, repeat) {
    return this.user(arg, currentUsage, possible, repeat);
  }

  async member(arg, currentUsage, possible, repeat, msg) {
    if ((/^<@!?\d+>$/.test(arg) && msg.guild.members.has(/\d+/.exec(arg)[0])) || (/\d+/.test(arg) && msg.guild.members.has(/\d+/.exec(arg)[0]) && arg.length > 5)) {
      return msg.guild.members.get(/\d+/.exec(arg)[0]);
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
  }

  async channel(arg, currentUsage, possible, repeat) {
    if (/^<#\d+>$/.test(arg) || this.client.channels.has(arg)) {
      return this.client.channels.get(/\d+/.exec(arg)[0]);
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be a channel tag or valid channel id.`;
  }

  async guild(arg, currentUsage, possible, repeat) {
    if (this.client.guilds.has(arg)) {
      return this.client.guilds.get(/\d+/.exec(arg)[0]);
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be a valid guild id.`;
  }

  async role(arg, currentUsage, possible, repeat, msg) {
    if (/^<@&\d+>$/.test(arg) || msg.guild.roles.has(arg)) {
      return msg.guild.roles.get(/\d+/.exec(arg)[0]);
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be a role mention or role id.`;
  }

  async literal(arg, currentUsage, possible, repeat) {
    if (arg.toLowerCase() === currentUsage.possibles[possible].name.toLowerCase()) {
      return arg.toLowerCase();
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw [
      `Your option did not litterally match the only possibility: (${currentUsage.possibles.map(poss => poss.name).join(", ")})`,
      "This is likely caused by a mistake in the usage string.",
    ].join("\n");
  }

  async boolean(arg, currentUsage, possible, repeat) {
    if (/^true|false$/i.test(arg)) {
      if (arg.toLowerCase() === "true") {
        return true;
      }
      return false;
    } else if (currentUsage.type === "optional" && !repeat) {
      return null;
    }
    throw `${currentUsage.possibles[possible].name} must be true or false.`;
  }

  async str(arg, currentUsage, possible, repeat) {
    return this.string(arg, currentUsage, possible, repeat);
  }

  async string(arg, currentUsage, possible, repeat) {
    if (currentUsage.possibles[possible].min && currentUsage.possibles[possible].max) {
      if (arg.length < currentUsage.possibles[possible].min || arg.length > currentUsage.possibles[possible].max) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        } else if (currentUsage.possibles[possible].min === currentUsage.possibles[possible].max) {
          throw `${currentUsage.possibles[possible].name} must be exactly ${currentUsage.possibles[possible].min} characters.`;
        } else {
          throw `${currentUsage.possibles[possible].name} must be between ${currentUsage.possibles[possible].min} and ${currentUsage.possibles[possible].max} characters.`;
        }
      } else {
        return arg;
      }
    } else if (currentUsage.possibles[possible].min) {
      if (arg.length < currentUsage.possibles[possible].min) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be longer than ${currentUsage.possibles[possible].min} characters.`;
      } else {
        return arg;
      }
    } else if (currentUsage.possibles[possible].max) {
      if (arg.length > currentUsage.possibles[possible].max) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be shorter than ${currentUsage.possibles[possible].max} characters.`;
      } else {
        return arg;
      }
    } else {
      return arg;
    }
  }

  async int(arg, currentUsage, possible, repeat) {
    return this.integer(arg, currentUsage, possible, repeat);
  }

  async integer(arg, currentUsage, possible, repeat) {
    arg = Number(arg);
    if (!Number.isInteger(arg)) {
      if (currentUsage.type === "optional" && !repeat) {
        return null;
      }
      throw `${currentUsage.possibles[possible].name} must be an integer.`;
    } else if (currentUsage.possibles[possible].min && currentUsage.possibles[possible].max) {
      if (arg < currentUsage.possibles[possible].min || arg > currentUsage.possibles[possible].max) {
        if (currentUsage.possibles[possible].min === currentUsage.possibles[possible].max) {
          if (currentUsage.type === "optional" && !repeat) {
            return null;
          }
          throw `${currentUsage.possibles[possible].name} must be exactly ${currentUsage.possibles[possible].min}\nSo why didn't the dev use a literal?`;
        } else if (currentUsage.type === "optional" && !repeat) {
          return null;
        } else {
          throw `${currentUsage.possibles[possible].name} must be between ${currentUsage.possibles[possible].min} and ${currentUsage.possibles[possible].max}.`;
        }
      } else {
        return arg;
      }
    } else if (currentUsage.possibles[possible].min) {
      if (arg < currentUsage.possibles[possible].min) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be greater than ${currentUsage.possibles[possible].min}.`;
      } else {
        return arg;
      }
    } else if (currentUsage.possibles[possible].max) {
      if (arg > currentUsage.possibles[possible].max) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be less than ${currentUsage.possibles[possible].max}.`;
      } else {
        return arg;
      }
    } else {
      return arg;
    }
  }

  async num(arg, currentUsage, possible, repeat) {
    return this.float(arg, currentUsage, possible, repeat);
  }

  async number(arg, currentUsage, possible, repeat) {
    return this.float(arg, currentUsage, possible, repeat);
  }

  async float(arg, currentUsage, possible, repeat) {
    arg = Number(arg);
    if (isNaN(arg)) {
      if (currentUsage.type === "optional" && !repeat) {
        return null;
      }
      throw `${currentUsage.possibles[possible].name} must be a valid number.`;
    } else if (currentUsage.possibles[possible].min && currentUsage.possibles[possible].max) {
      if (arg < currentUsage.possibles[possible].min || arg > currentUsage.possibles[possible].max) {
        if (currentUsage.possibles[possible].min === currentUsage.possibles[possible].max) {
          if (currentUsage.type === "optional" && !repeat) {
            return null;
          }
          throw `${currentUsage.possibles[possible].name} must be exactly ${currentUsage.possibles[possible].min}\nSo why didn't the dev use a literal?`;
        } else if (currentUsage.type === "optional" && !repeat) {
          return null;
        } else {
          throw `${currentUsage.possibles[possible].name} must be between ${currentUsage.possibles[possible].min} and ${currentUsage.possibles[possible].max}.`;
        }
      } else {
        return arg;
      }
    } else if (currentUsage.possibles[possible].min) {
      if (arg < currentUsage.possibles[possible].min) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be greater than ${currentUsage.possibles[possible].min}.`;
      } else {
        return arg;
      }
    } else if (currentUsage.possibles[possible].max) {
      if (arg > currentUsage.possibles[possible].max) {
        if (currentUsage.type === "optional" && !repeat) {
          return null;
        }
        throw `${currentUsage.possibles[possible].name} must be less than ${currentUsage.possibles[possible].max}.`;
      } else {
        return arg;
      }
    } else {
      return arg;
    }
  }

  async url(arg, currentUsage, possible, repeat) {
    const res = url.parse(arg);
    if (!res.protocol || !res.hostname) {
      if (currentUsage.type === "optional" && !repeat) {
        return null;
      }
      throw `${currentUsage.possibles[possible].name} must be a valid url.`;
    } else {
      return arg;
    }
  }
};
