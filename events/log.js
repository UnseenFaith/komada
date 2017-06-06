const moment = require("moment");
const chalk = require("chalk");

/* eslint-disable no-use-before-define */
exports.run = (client, data, type = "log") => {
  data = resolveObject(data);
  let timestamp = "";

  function padLines(text) {
    return text.split("\n").forEach(str => str.padStart(timestamp.length + str, timestamp));
  }

  if (!client.config.disableLogTimestamps) timestamp = moment().format("YYYY-MM-DD HH:mm:ss ");
  switch (type.toLowerCase()) {
    case "debug":
      if (!client.config.disableLogTimestamps && !client.config.disableLogColor) timestamp = chalk.bgMagenta(timestamp);
      console.log(padLines(data));
      break;
    case "warn":
      if (!client.config.disableLogTimestamps && !client.config.disableLogColor) timestamp = chalk.black.bgYellow(timestamp);
      console.log(padLines(data));
      break;
    case "error":
      if (!client.config.disableLogTimestamps && !client.config.disableLogColor) timestamp = chalk.bgRed(timestamp);
      console.log(padLines(data));
      break;
    case "log":
      if (!client.config.disableLogTimestamps && !client.config.disableLogColor) timestamp = chalk.bgBlue(timestamp);
      console.log(padLines(data));
      break;
      // no default
  }
};

function resolveObject(error) {
  error = error.stack || error.message || error;

  if (typeof error === "object" && typeof error !== "string") {
    return require("util").inspect(error, { depth: 0, colors: true });
  }
  return error;
}
