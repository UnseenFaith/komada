const now = require("performance-now");
const { MessageAttachment } = require("discord.js");
const { inspect } = require("util");

let outputTo;
let getTypeStr;
let sendTooLongQuery;

exports.init = async (client) => {
  // How the evaled result is outputted
  outputTo = {
    channel: (msg, topLine, evaled) => msg.send(`\`${topLine}\`\n${client.methods.util.codeBlock("js", client.methods.util.clean(evaled))}`),
    log: (msg, topLine, evaled) => client.emit("log", `${topLine}\n${evaled}`),
    upload: (msg, topLine, evaled) => msg.channel.send("", new MessageAttachment(Buffer.from(`// ${topLine}\n${evaled}`), "eval.js")),
  };

  getTypeStr = async (value, i = 0) => {
    let typeStr = "";
    const basicType = typeof value;
    if (basicType === "object") {
      if (value === null) {
        typeStr = "null primitive";
      } else {
        let objType = value.constructor.name;
        if (value instanceof Promise) {
          if (objType !== "Promise") objType += " promise";
          typeStr = i <= client.config.eval.typeRecursionLimit ?
            `awaited ${objType} object ➡ ${await getTypeStr(await value, i + 1)}` :
            `${objType} object`;
        } else if (value instanceof Boolean || value instanceof Number || value instanceof String) {
          typeStr = `${objType} object (not a primitive!)`;
        } else {
          if (objType === "Object") objType = "plain";
          typeStr = `${objType} object`;
        }
      }
    } else if (basicType === "function") {
      const objType = value.constructor.name;
      typeStr = objType === "Function" ?
        `${basicType} object` :
        `${objType} ${basicType} object`;
    } else {
      typeStr = `${basicType} primitive`;
    }

    return typeStr;
  };

  sendTooLongQuery = async (cmdMsg, topLine, evaled, question, options) => {
    const queryMsg = await cmdMsg.channel.send(`${question} (10s til auto-cancel)`);
    try {
      const collected = await cmdMsg.channel.awaitMessages(
        msg => msg.author.id === cmdMsg.author.id,
        { max: 1, time: 10000, errors: ["time"] },
      );
      const msg = collected.first();
      queryMsg.delete();
      msg.delete();

      const text = msg.content.toLowerCase();
      if (text.startsWith("y")) {
        // Whatever the yes option says to do
        return outputTo[options.yes](queryMsg, topLine, evaled);
      } else if (text.startsWith("l")) {
        // Log to console
        return outputTo.log(queryMsg, topLine, evaled);
      } else if (text.startsWith("u")) {
        // Upload as a file attachment and send to channel
        return outputTo.upload(queryMsg, topLine, evaled);
      } else if (text.startsWith("t")) {
        // Truncate and send to channel
        // Truncate the evaled output, both its # of lines and each line's length
        const evaledLines = evaled.split("\n");
        const newLength = client.config.eval.tooManyLines - 1;
        const lastIndex = newLength - 1;
        for (let i = 0; i < evaledLines.length; i++) {
          const line = evaledLines[i];
          if (i >= newLength) delete evaledLines[i];
          else if (i === lastIndex) evaledLines[i] = "...";
          else if (line.length > client.config.eval.mobileCharsPerLine) evaledLines[i] = `${line.substr(0, client.config.eval.mobileCharsPerLine - 3)}...`;
        }
        return outputTo.channel(queryMsg, topLine, evaledLines.join("\n"));
      }
      return null;
    } catch (error) {
      return queryMsg.delete();
    }
  };
};


const roundTo3 = num => Math.round(num * 1000) / 1000;

const getNiceDuration = (time) => {
  if (time >= 1000) return `${roundTo3(time / 1000)}s`;
  if (time < 1) return `${roundTo3(time * 1000)}μs`;
  return `${roundTo3(time)}ms`;
};

exports.run = async (client, msg, [mult, d, l, s, ...code]) => {
  mult = mult || "";
  const flags = {
    delete: Boolean(d) || mult.includes("d"),
    log: Boolean(l) || mult.includes("l"),
    silent: Boolean(s) || mult.includes("s"),
  };
  code = code.join(" ");

  if (flags.delete) msg.delete();

  try {
    const start = now();
    const evaledP = eval(code); // eslint-disable-line no-eval
    let evaled = evaledP instanceof Promise ? await evaledP : evaledP;
    const time = getNiceDuration(now() - start);

    if (flags.silent) return null;

    const topLine = `${await getTypeStr(evaledP)}, ${time}`;
    if (typeof evaled !== "string") evaled = inspect(evaled, { depth: client.config.eval.inspectionDepth });

    if (flags.log) return outputTo.log(msg, topLine, evaled);

    // 1988 is 2000 - 12 (the chars that are added, "`...`\n```js\n...```")
    if (evaled.length > 1988 - topLine.length) {
      return sendTooLongQuery(msg, topLine, evaled,
        "Output is too long. Log it to console instead? Or `truncate` it or `upload` it as a file?",
        { yes: "log" });
    }

    const lines = evaled.split("\n");
    let lineCount = lines.length;
    let calcWithScreenWrap = false;
    if (lineCount < client.config.eval.tooManyLines) {
      lineCount = lines.reduce((count, line) => count + Math.ceil(line.length / client.config.eval.mobileCharsPerLine), 0);
      calcWithScreenWrap = true;
    }
    if (lineCount >= client.config.eval.tooManyLines) {
      return sendTooLongQuery(msg, topLine, evaled,
        calcWithScreenWrap ?
          `The output is long (${lineCount} lines, plus wrapping on small screens). Send it anyway? Or \`truncate\` it and send it, or \`log\` it to console, or \`upload\` it as a file.` :
          `The output is long (${lineCount} lines). Send it anyway? Or \`truncate\` it and send it, or \`log\` it to console, or \`upload\` it as a file.`,
        { yes: "channel" });
    }

    return outputTo.channel(msg, topLine, evaled);
  } catch (error) {
    if (flags.silent) return null;
    if (error && error.stack) client.emit("error", error.stack);
    if (flags.log) return null;
    return msg.send(`\`ERROR\`\n${client.methods.util.codeBlock("js", client.methods.util.clean(error))}`);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["ev"],
  permLevel: 10,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "eval",
  description: "Evaluates arbitrary JavaScript. Reserved for bot owner.",
  usage: "[-dl|-ld|-ds|-sd] [-d|--delete] [-l|--log] [-s|--silent] <expression:str> [...]",
  usageDelim: " ",
  extendedHelp: `Flags:
-d, --delete  delete the command message
-l, --log     send the result to the console instead of Discord; cannot be combined with -d
-s, --silent  eval the code without showing the result; cannot be combined with -l`,
};
