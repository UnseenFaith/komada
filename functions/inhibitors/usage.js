exports.conf = {
  enabled: true,
  spamProtection: true
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {

    let usage = client.funcs.parseUsage(cmd.help.usage);
    console.log(usage[1]);
    let args = msg.content.slice(client.config.prefix.length).split(" ").slice(1).join(" ").split(cmd.help.usageDelim !== "" ? cmd.help.usageDelim : null);
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
        resolve(args);
      } else if (currentUsage.type === "required" && args[i] === undefined) {
        reject(currentUsage.possibles.length === 1 ? `${currentUsage.possibles[0].name} is a required argument.` : `Missing a required option: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})`);
      } else if (currentUsage.possibles.length === 1) {
        switch (currentUsage.possibles[0].type) {
          case "literal":
            if (args[i].toLowerCase() === currentUsage.possibles[0].name.toLowerCase()) {
              args[i] = args[i].toLowerCase();
            } else {
              reject(`Your option did not litterally match the only possibility: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})\nThis is likely caused by a mistake in the usage string.`);
            }
            break;
          case "mention":
            if (!/^<@!?\d+>$/.test(args[i])) {
              reject(`${currentUsage.possibles[i].name} must be a mention.`);
            } else {
              args[i] = msg.mentions.users.get(/\d+/.exec(args[i])[0]);
            }
            break;
          case "str":
          case "string":
            //is already a string :okhand:
            break;
          case "int":
          case "integer":
            if (!client.funcs.isInteger(args[i])) {
              reject(`${currentUsage.possibles[i].name} must be an integer.`);
            } else {
              args[i] = parseInt(args[i]);
            }
            break;
          case "float":
            if (parseFloat(args[i]) === "NaN") {
              reject(`${currentUsage.possibles[i].name} must be an integer.`);
            } else {
              args[i] = parseFloat(args[i]);
            }
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
            case "mention":
              if (/^<@!?\d+>$/.test(args[i])) {
                args[i] = msg.mentions.users.get(/\d+/.exec(args[i])[0]);
                validated = true;
              }
              break;
            case "str":
            case "string":
              validated = true;
              break;
            case "int":
            case "integer":
              if (client.funcs.isInteger(args[i])) {
                args[i] = parseInt(args[i]);
                validated = true;
              }
              break;
            case "float":
              if (parseFloat(args[i]) !== "NaN") {
                args[i] = parseFloat(args[i]);
                validated = true;
              }
              break;
          }
        });
        if (!validated) {
          reject(`Your option didn't match any of the possibilities: (${currentUsage.possibles.map(p => {return p.name;}).join(", ")})`);
        }
      }
    }
    resolve(args);
  });
};
