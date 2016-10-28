exports.conf = {
  enabled: true,
  spamProtection: true
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    let usage = client.funcs.parseUsage(cmd.help.usage);
    let prefixLength = client.config.prefix.length;
    if (client.config.prefixMention.test(msg.content)) prefixLength = client.config.prefixMention.exec(msg.content)[0].length + 1;
    let args = msg.content.slice(prefixLength).split(" ").slice(1).join(" ").split(cmd.help.usageDelim !== "" ? cmd.help.usageDelim : null);
    if (args[0] === "") args = [];
    let currentUsage;
    let repeat = false;
    if (usage.length === 0) resolve();

    (function validateArgs(i) {
      if (i >= usage.length && i >= args.length) {
        resolve(args);
      } else if (usage[i]) {
        if (usage[i].type !== "repeat") { //Handle if args length > usage length
          currentUsage = usage[i];
        } else if (usage[i].type === "repeat") { //Handle if usage ends in a repeat
          currentUsage.type = "optional"; //if there are no optional args passed
          repeat = true;
        }
      } else if (!repeat) { //Handle if usage does not end in a repeat
        resolve(args);
      }
      if (currentUsage.type === "optional" && (args[i] === undefined || args[i] === "")) { //Handle if args length < required usage length
        if (usage.slice(i).some(u => { return u.type === "required"; })) {
          reject("Missing one or more required arguments after end of input.");
        } else {
          resolve(args);
        }
      } else if (currentUsage.type === "required" && args[i] === undefined) {
        reject(currentUsage.possibles.length === 1 ? `${currentUsage.possibles[0].name} is a required argument.` : `Missing a required option: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})`);
      } else if (currentUsage.possibles.length === 1) {
        switch (currentUsage.possibles[0].type) {
          case "literal":
            if (args[i].toLowerCase() === currentUsage.possibles[0].name.toLowerCase()) {
              args[i] = args[i].toLowerCase();
              validateArgs(++i);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`Your option did not litterally match the only possibility: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})\nThis is likely caused by a mistake in the usage string.`);
            }
            break;
          case "msg":
          case "message":
            if (/^\d+$/.test(args[i])) {
              if (client.config.selfbot) {
                msg.channel.fetchMessages({
                  around: args[i]
                }).then(m => {
                  args[i] = m.filter(e => e.id == args[i]).first();
                  validateArgs(++i);
                }).catch(() => {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                    validateArgs(++i);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be a valid message id.`);
                  }
                });
              } else {
                msg.channel.fetchMessage(args[i])
                  .then(m => {
                    args[i] = m;
                    validateArgs(++i);
                  })
                  .catch(() => {
                    if (currentUsage.type === "optional" && !repeat) {
                      args.splice(i, 0, undefined);
                      validateArgs(++i);
                    } else {
                      reject(`${currentUsage.possibles[0].name} must be a valid message id.`);
                    }
                  });
              }
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a valid message id.`);
            }
            break;
          case "user":
          case "mention":
            if (/^<@!?\d+>$/.test(args[i]) && client.users.has(/\d+/.exec(args[i])[0]) && args[i].length > 5) {
              args[i] = client.users.get(/\d+/.exec(args[i])[0]);
              validateArgs(++i);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a mention or valid user id.`);
            }
            break;
          case "channel":
            if (/^<#\d+>$/.test(args[i]) || client.channels.has(args[i])) {
              args[i] = client.channels.get(/\d+/.exec(args[i])[0]);
              validateArgs(++i);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a channel tag or valid channel id.`);
            }
            break;
          case "guild":
            if (client.guilds.has(args[i])) {
              args[i] = client.guilds.get(/\d+/.exec(args[i])[0]);
              validateArgs(++i);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a valid guild id.`);
            }
            break;
          case "role":
            if (/^<@&\d+>$/.test(args[i]) || msg.guild.roles.has(args[i])) {
              args[i] = msg.guild.roles.get(/\d+/.exec(args[i])[0]);
              validateArgs(++i);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a role mention or role id.`);
            }
            break;
          case "str":
          case "string":
            if (currentUsage.possibles[0].min && currentUsage.possibles[0].max) {
              if (args[i].length < currentUsage.possibles[0].min || args[i].length > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  if (currentUsage.possibles[0].min === currentUsage.possibles[0].max) {
                    reject(`${currentUsage.possibles[0].name} must be exactly ${currentUsage.possibles[0].min} characters.`);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be between ${currentUsage.possibles[0].min} and ${currentUsage.possibles[0].max} characters.`);
                  }
                }
              } else {
                validateArgs(++i);
              }
            } else if (currentUsage.possibles[0].min) {
              if (args[i].length < currentUsage.possibles[0].min) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be longer than ${currentUsage.possibles[0].min} characters.`);
                }
              } else {
                validateArgs(++i);
              }
            } else if (currentUsage.possibles[0].max) {
              if (args[i].length > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be shorter than ${currentUsage.possibles[0].max} characters.`);
                }
              } else {
                validateArgs(++i);
              }
            } else {
              validateArgs(++i);
            }
            break;
          case "int":
          case "integer":
            if (!Number.isInteger(parseInt(args[i]))) {
              if (currentUsage.type === "optional" && !repeat) {
                args.splice(i, 0, undefined);
                validateArgs(++i);
              } else {
                reject(`${currentUsage.possibles[0].name} must be an integer.`);
              }
            } else if (currentUsage.possibles[0].min && currentUsage.possibles[0].max) {
              args[i] = parseInt(args[i]);
              if (args[i] < currentUsage.possibles[0].min || args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.possibles[0].min === currentUsage.possibles[0].max) {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                    validateArgs(++i);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be exactly ${currentUsage.possibles[0].min}\nSo why didn't the dev use a literal?`);
                  }
                } else {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                    validateArgs(++i);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be between ${currentUsage.possibles[0].min} and ${currentUsage.possibles[0].max}.`);
                  }
                }
              } else {
                validateArgs(++i);
              }
            } else if (currentUsage.possibles[0].min) {
              args[i] = parseInt(args[i]);
              if (args[i] < currentUsage.possibles[0].min) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be greater than ${currentUsage.possibles[0].min}.`);
                }
              } else {
                validateArgs(++i);
              }
            } else if (currentUsage.possibles[0].max) {
              args[i] = parseInt(args[i]);
              if (args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be less than ${currentUsage.possibles[0].max}.`);
                }
              } else {
                validateArgs(++i);
              }
            } else {
              args[i] = parseInt(args[i]);
              validateArgs(++i);
            }
            break;
          case "num":
          case "number":
          case "float":
            if (parseFloat(args[i]) === "NaN") {
              if (currentUsage.type === "optional" && !repeat) {
                args.splice(i, 0, undefined);
                validateArgs(++i);
              } else {
                reject(`${currentUsage.possibles[0].name} must be a valid number.`);
              }
            } else if (currentUsage.possibles[0].min && currentUsage.possibles[0].max) {
              args[i] = parseFloat(args[i]);
              if (args[i] < currentUsage.possibles[0].min || args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.possibles[0].min === currentUsage.possibles[0].max) {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                    validateArgs(++i);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be exactly ${currentUsage.possibles[0].min}\nSo why didn't the dev use a literal?`);
                  }
                } else {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                    validateArgs(++i);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be between ${currentUsage.possibles[0].min} and ${currentUsage.possibles[0].max}.`);
                  }
                }
              } else {
                validateArgs(++i);
              }
            } else if (currentUsage.possibles[0].min) {
              args[i] = parseFloat(args[i]);
              if (args[i] < currentUsage.possibles[0].min) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be greater than ${currentUsage.possibles[0].min}.`);
                }
              } else {
                validateArgs(++i);
              }
            } else if (currentUsage.possibles[0].max) {
              args[i] = parseFloat(args[i]);
              if (args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                  validateArgs(++i);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be less than ${currentUsage.possibles[0].max}.`);
                }
              } else {
                validateArgs(++i);
              }
            } else {
              args[i] = parseFloat(args[i]);
              validateArgs(++i);
            }
            break;
          case "url":
            if (!/^((https?|ftps?|sftp):\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}))(:\b([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\b)?(\/([a-zA-Z0-9:\/\?#\[\]@!$&'()*+,;=%-._~]+)?)?$/.test(args[i])) {
              if (currentUsage.type === "optional" && !repeat) {
                args.splice(i, 0, undefined);
                validateArgs(++i);
              } else {
                reject(`${currentUsage.possibles[0].name} must be a valid url.`);
              }
            } else {
              validateArgs(++i);
            }
            break;
          default:
            console.warn("Unknown Argument Type encountered");
            validateArgs(++i);
            break;
        }
      } else {
        let validated = false;
        (function multiPossibles(p) {
          if (validated) {
            validateArgs(++i);
            return;
          } else if (p >= currentUsage.possibles.length) {
            if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
              validateArgs(++i);
            } else {
              reject(`Your option didn't match any of the possibilities: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})`);
            }
            return;
          }
          switch (currentUsage.possibles[p].type) {
            case "literal":
              if (args[i].toLowerCase() === currentUsage.possibles[p].name.toLowerCase()) {
                args[i] = args[i].toLowerCase();
                validated = true;
                multiPossibles(++p);
              } else {
                multiPossibles(++p);
              }
              break;
            case "msg":
            case "message":
              if (/^\d+$/.test(args[i])) {
                msg.channel.fetchMessage(args[i])
                  .then(m => {
                    args[i] = m;
                    validated = true;
                    multiPossibles(++p);
                  })
                  .catch(() => {
                    multiPossibles(++p);
                  });
              } else {
                multiPossibles(++p);
              }
              break;
            case "user":
            case "mention":
              const result = /\d+/.exec(args[i]);
              if (result && args[i].length > 5 &&  client.users.has(result[0])) {
                args[i] = client.users.get(/\d+/.exec(args[i])[0]);
                validated = true;
                multiPossibles(++p);
              } else {
                multiPossibles(++p);
              }
              break;
            case "channel":
              if (/^<#\d+>$/.test(args[i]) || client.channels.has(args[i])) {
                args[i] = client.channels.get(/\d+/.exec(args[i])[0]);
                validated = true;
                multiPossibles(++p);
              } else {
                multiPossibles(++p);
              }
              break;
            case "guild":
              if (client.guilds.has(args[i])) {
                args[i] = client.guilds.get(/\d+/.exec(args[i])[0]);
                validated = true;
                multiPossibles(++p);
              } else {
                multiPossibles(++p);
              }
              break;
            case "role":
              if (/^<@&\d+>$/.test(args[i]) || msg.guild.roles.has(args[i])) {
                args[i] = msg.guild.roles.get(/\d+/.exec(args[i])[0]);
                validated = true;
                multiPossibles(++p);
              } else {
                multiPossibles(++p);
              }
              break;
            case "str":
            case "string":
              if (currentUsage.possibles[p].min && currentUsage.possibles[p].max) {
                if (args[i].length <= currentUsage.possibles[p].max && args[i].length >= currentUsage.possibles[p].min) {
                  validated = true;
                  multiPossibles(++p);
                } else {
                  multiPossibles(++p);
                }
              } else if (currentUsage.possibles[p].min) {
                if (args[i].length >= currentUsage.possibles[p].min) {
                  validated = true;
                  multiPossibles(++p);
                } else {
                  multiPossibles(++p);
                }
              } else if (currentUsage.possibles[p].max) {
                if (args[i].length <= currentUsage.possibles[p].max) {
                  validated = true;
                  multiPossibles(++p);
                } else {
                  multiPossibles(++p);
                }
              } else {
                validated = true;
                multiPossibles(++p);
              }
              break;
            case "int":
            case "integer":
              if (Number.isInteger(parseInt(args[i]))) {
                args[i] = parseInt(args[i]);
                if (currentUsage.possibles[p].min && currentUsage.possibles[p].max) {
                  if (args[i] <= currentUsage.possibles[p].max && args[i] >= currentUsage.possibles[p].min) {
                    validated = true;
                    multiPossibles(++p);
                  } else {
                    multiPossibles(++p);
                  }
                } else if (currentUsage.possibles[p].min) {
                  if (args[i] >= currentUsage.possibles[p].min) {
                    validated = true;
                    multiPossibles(++p);
                  } else {
                    multiPossibles(++p);
                  }
                } else if (currentUsage.possibles[p].max) {
                  if (args[i] <= currentUsage.possibles[p].max) {
                    validated = true;
                    multiPossibles(++p);
                  } else {
                    multiPossibles(++p);
                  }
                } else {
                  validated = true;
                  multiPossibles(++p);
                }
              } else {
                multiPossibles(++p);
              }
              break;
            case "num":
            case "number":
            case "float":
              if (parseFloat(args[i]) !== "NaN") {
                args[i] = parseFloat(args[i]);
                if (currentUsage.possibles[p].min && currentUsage.possibles[p].max) {
                  if (args[i] <= currentUsage.possibles[p].max && args[i] >= currentUsage.possibles[p].min) {
                    validated = true;
                    multiPossibles(++p);
                  } else {
                    multiPossibles(++p);
                  }
                } else if (currentUsage.possibles[p].min) {
                  if (args[i] >= currentUsage.possibles[p].min) {
                    validated = true;
                    multiPossibles(++p);
                  } else {
                    multiPossibles(++p);
                  }
                } else if (currentUsage.possibles[p].max) {
                  if (args[i] <= currentUsage.possibles[p].max) {
                    validated = true;
                    multiPossibles(++p);
                  } else {
                    multiPossibles(++p);
                  }
                } else {
                  validated = true;
                  multiPossibles(++p);
                }
              } else {
                multiPossibles(++p);
              }
              break;
            case "url":
              if (/^((https?|ftps?|sftp):\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}))(:\b([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\b)?(\/([a-zA-Z0-9:\/\?#\[\]@!$&'()*+,;=%-._~]+)?)?$/.test(args[i])) {
                validated = true;
                multiPossibles(++p);
              } else {
                multiPossibles(++p);
              }
              break;
            default:
              console.warn("Unknown Argument Type encountered");
              multiPossibles(++p);
              break;
          }
        })(0);
      }
    })(0);
  });
};
