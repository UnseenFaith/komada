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
    for (let i = 0; !(i >= usage.length && i >= args.length); i++) {
      if (usage[i] && usage[i].type !== "repeat") { //Handle if args length > usage length
        currentUsage = usage[i];
      } else if (usage[i].type === "repeat") { //Handle if usage ends in a repeat
        currentUsage.type = "optional"; //if there are no optional args passed
        repeat = true;
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
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
            } else {
              reject(`Your option did not litterally match the only possibility: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})\nThis is likely caused by a mistake in the usage string.`);
            }
            break;
          case "msg":
          case "message":
            if (msg.channel.messages.has(args[i])) {
              args[i] = msg.channel.messages.get(args[i]);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a valid message id.`);
            }
            break;
          case "user":
          case "mention":
            if (/^<@!?\d+>$/.test(args[i]) && client.users.has(args[i]) && args[i].length > 5) {
              args[i] = client.users.get(/\d+/.exec(args[i])[0]);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a mention or valid user id.`);
            }
            break;
          case "channel":
            if (/^<#\d+>$/.test(args[i]) && client.channels.has(args[i])) {
              args[i] = client.channels.get(/\d+/.exec(args[i])[0]);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a channel tag or valid channel id.`);
            }
            break;
          case "guild":
            if (client.guilds.has(args[i])) {
              args[i] = client.guilds.get(/\d+/.exec(args[i])[0]);
            } else if (currentUsage.type === "optional" && !repeat) {
              args.splice(i, 0, undefined);
            } else {
              reject(`${currentUsage.possibles[0].name} must be a valid guild id.`);
            }
            break;
          case "str":
          case "string":
            //is already a string :okhand:
            if (currentUsage.possibles[0].min && currentUsage.possibles[0].max) {
              if (args[i].length < currentUsage.possibles[0].min || args[i].length > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  if (currentUsage.possibles[0].min === currentUsage.possibles[0].max) {
                    reject(`${currentUsage.possibles[0].name} must be exactly ${currentUsage.possibles[0].min} characters.`);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be between ${currentUsage.possibles[0].min} and ${currentUsage.possibles[0].max} characters.`);
                  }
                }
              }
            } else if (currentUsage.possibles[0].min) {
              if (args[i].length < currentUsage.possibles[0].min) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be longer than ${currentUsage.possibles[0].min} characters.`);
                }
              }
            } else if (currentUsage.possibles[0].max) {
              if (args[i].length > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be shorter than ${currentUsage.possibles[0].max} characters.`);
                }
              }
            }
            break;
          case "int":
          case "integer":
            if (!client.funcs.isInteger(args[i])) {
              if (currentUsage.type === "optional" && !repeat) {
                args.splice(i, 0, undefined);
              } else {
                reject(`${currentUsage.possibles[0].name} must be an integer.`);
              }
            } else if (currentUsage.possibles[0].min && currentUsage.possibles[0].max) {
              args[i] = parseInt(args[i]);
              if (args[i] < currentUsage.possibles[0].min || args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.possibles[0].min === currentUsage.possibles[0].max) {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be exactly ${currentUsage.possibles[0].min}\nSo why didn't the dev use a literal?`);
                  }
                } else {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be between ${currentUsage.possibles[0].min} and ${currentUsage.possibles[0].max}.`);
                  }
                }
              }
            } else if (currentUsage.possibles[0].min) {
              args[i] = parseInt(args[i]);
              if (args[i] < currentUsage.possibles[0].min) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be greater than ${currentUsage.possibles[0].min}.`);
                }
              }
            } else if (currentUsage.possibles[0].max) {
              args[i] = parseInt(args[i]);
              if (args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be less than ${currentUsage.possibles[0].max}.`);
                }
              }
            } else {
              args[i] = parseInt(args[i]);
            }
            break;
          case "num":
          case "number":
          case "float":
            if (parseFloat(args[i]) === "NaN") {
              if (currentUsage.type === "optional" && !repeat) {
                args.splice(i, 0, undefined);
              } else {
                reject(`${currentUsage.possibles[0].name} must be a valid number.`);
              }
            } else if (currentUsage.possibles[0].min && currentUsage.possibles[0].max) {
              args[i] = parseFloat(args[i]);
              if (args[i] < currentUsage.possibles[0].min || args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.possibles[0].min === currentUsage.possibles[0].max) {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be exactly ${currentUsage.possibles[0].min}\nSo why didn't the dev use a literal?`);
                  }
                } else {
                  if (currentUsage.type === "optional" && !repeat) {
                    args.splice(i, 0, undefined);
                  } else {
                    reject(`${currentUsage.possibles[0].name} must be between ${currentUsage.possibles[0].min} and ${currentUsage.possibles[0].max}.`);
                  }
                }
              }
            } else if (currentUsage.possibles[0].min) {
              args[i] = parseFloat(args[i]);
              if (args[i] < currentUsage.possibles[0].min) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be greater than ${currentUsage.possibles[0].min}.`);
                }
              }
            } else if (currentUsage.possibles[0].max) {
              args[i] = parseFloat(args[i]);
              if (args[i] > currentUsage.possibles[0].max) {
                if (currentUsage.type === "optional" && !repeat) {
                  args.splice(i, 0, undefined);
                } else {
                  reject(`${currentUsage.possibles[0].name} must be less than ${currentUsage.possibles[0].max}.`);
                }
              }
            } else {
              args[i] = parseFloat(args[i]);
            }
            break;
          case "url":
            if (!/^((https?|ftps?|sftp):\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}))(:\b([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\b)?(\/([a-zA-Z0-9:\/\?#\[\]@!$&'()*+,;=%-._~]+)?)?$/.test(args[i])) {
              if (currentUsage.type === "optional" && !repeat) {
                args.splice(i, 0, undefined);
              } else {
                reject(`${currentUsage.possibles[0].name} must be a valid url.`);
              }
            }
            break;
          default:
            console.warn("Unknown Argument Type encountered");
            break;
        }
      } else {
        let validated = false;
        currentUsage.possibles.forEach(p => {
          switch (p.type) {
            case "literal":
              if (args[i].toLowerCase() === p.name.toLowerCase()) {
                args[i] = args[i].toLowerCase();
                validated = true;
              }
              break;
            case "msg":
            case "message":
              if (/^\d+$/.test(args[i]) && msg.channel.messages.has(args[i])) {
                args[i] = msg.channel.messages.get(args[i]);
                validated = true;
              }
              break;
            case "user":
            case "mention":
              if ((/^<@!?\d+>$/.test(args[i]) || client.users.has(args[i])) && args[i].length > 5) {
                args[i] = client.users.get(/\d+/.exec(args[i])[0]);
                validated = true;
              }
              break;
            case "channel":
              if (/^<#\d+>$/.test(args[i]) || client.channels.has(args[i])) {
                args[i] = client.channels.get(/\d+/.exec(args[i])[0]);
                validated = true;
              }
              break;
            case "guild":
              if (client.guilds.has(args[i])) {
                args[i] = client.guilds.get(/\d+/.exec(args[i])[0]);
                validated = true;
              }
              break;
            case "str":
            case "string":
              if (p.min && p.max) {
                if (args[i].length <= p.max && args[i].length >= p.min) validated = true;
              } else if (p.min) {
                if (args[i].length >= p.min) validated = true;
              } else if (p.max) {
                if (args[i].length <= p.max) validated = true;
              } else {
                validated = true;
              }
              break;
            case "int":
            case "integer":
              if (client.funcs.isInteger(args[i])) {
                args[i] = parseInt(args[i]);
                if (p.min && p.max) {
                  if (args[i] <= p.max && args[i] >= p.min) validated = true;
                } else if (p.min) {
                  if (args[i] >= p.min) validated = true;
                } else if (p.max) {
                  if (args[i] <= p.max) validated = true;
                } else {
                  validated = true;
                }
              }
              break;
            case "num":
            case "number":
            case "float":
              if (parseFloat(args[i]) !== "NaN") {
                args[i] = parseFloat(args[i]);
                if (p.min && p.max) {
                  if (args[i] <= p.max && args[i] >= p.min) validated = true;
                } else if (p.min) {
                  if (args[i] >= p.min) validated = true;
                } else if (p.max) {
                  if (args[i] <= p.max) validated = true;
                } else {
                  validated = true;
                }
              }
              break;
            case "url":
              if (/^((https?|ftps?|sftp):\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}))(:\b([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\b)?(\/([a-zA-Z0-9:\/\?#\[\]@!$&'()*+,;=%-._~]+)?)?$/.test(args[i])) {
                validated = true;
              }
              break;
            default:
              console.warn("Unknown Argument Type encountered");
              break;
          }
        });
        if (!validated) {
          if (currentUsage.type === "optional" && !repeat) {
            args.splice(i, 0, undefined);
          } else {
            reject(`Your option didn't match any of the possibilities: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})`);
          }
        }
      }
    }
    resolve(args);
  });
};
