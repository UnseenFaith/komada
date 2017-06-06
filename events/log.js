const moment = require("moment");
const chalk = require("chalk");
const lpad = require("lpad");

/* eslint-disable no-use-before-define */
exports.run = (client, data, type = "log") => {
  data = resolveObject(data);
  let timestamp = "";
  if (!client.config.disableLogTimestamps) timestamp = moment().format("YYYY-MM-DD HH:mm:ss ");
  switch (type.toLowerCase()) {
    case "debug":
      if (!client.config.disableLogTimestamps) timestamp = chalk.bgMagenta(timestamp);
      console.log(lpad(data, timestamp));
      break;
    case "warn":
      if (!client.config.disableLogTimestamps) timestamp = chalk.black.bgYellow(timestamp);
      console.log(lpad(data, timestamp));
      break;
    case "error":
      if (!client.config.disableLogTimestamps) timestamp = chalk.bgRed(timestamp);
      console.log(lpad(data, timestamp));
      break;
    case "log":
      if (!client.config.disableLogTimestamps) timestamp = chalk.bgBlue(timestamp);
      console.log(lpad(data, timestamp));
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
