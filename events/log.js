const moment = require("moment");
const chalk = require("chalk");

/* eslint-disable no-use-before-define */
exports.run = (client, data, type = "log") => {
  type = type.toLowerCase();

  data = data.stack || data.message || data;
  if (typeof data === "object" && typeof data !== "string" && !Array.isArray(data)) data = require("util").inspect(data, { depth: 0, colors: true });
  if (Array.isArray(data)) data = data.join["\n"];

  let timestamp = "";
  if (!client.config.disableLogTimestamps) {
    timestamp = moment().format("YYYY-MM-DD HH:mm:ss ");
    if (!client.config.disableLogColor) {
      switch (type) {
        case "debug":
          timestamp = chalk.bgMagenta(timestamp);
          break;
        case "warn":
          timestamp = chalk.black.bgYellow(timestamp);
          break;
        case "error":
          timestamp = chalk.bgRed(timestamp);
          break;
        case "log":
          timestamp = chalk.bgBlue(timestamp);
          break;
          // no default
      }
    }
  }

  if (type === "debug") type = "log";
  console[type](data.split("\n").map(str => str.padStart(timestamp.length + str, timestamp)).join("\n"));
};
