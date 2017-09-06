const moment = require("moment");
const chalk = require("chalk");

const clk = new chalk.constructor({ enabled: true });
const formats = {
  verbose: { time: clk.grey, msg: clk.grey, logger: "log" },
  debug: { time: clk.magenta, logger: "log" },
  log: { time: clk.blue },
  warn: { time: clk.black.bgYellow },
  error: { time: clk.bgRed },
  wtf: { time: clk.bold.underline.bgRed, msg: clk.bold.underline.bgRed, logger: "error" },
};

/* eslint-disable no-use-before-define */
exports.run = (client, data, type = "log") => {
  type = type.toLowerCase();

  data = data.stack || data.message || data;
  if (typeof data === "object" && typeof data !== "string" && !Array.isArray(data)) data = require("util").inspect(data, { depth: 0, colors: true });
  if (Array.isArray(data)) data = data.join["\n"];

  const format = formats[type || "log"];
  let time = client.config.disableLogTimestamps ? "" : `[${moment().format("YYYY-MM-DD HH:mm:ss")}]`;
  if (!client.config.disableLogColor) time = format.time(time);
  console[format.logger || "log"](data.split("\n").map(str => `${time}${format.msg && !client.config.disableLogColor ? format.msg(time ? ` ${str}` : str) : time ? ` ${str}` : str}`).join("\n"));
};
