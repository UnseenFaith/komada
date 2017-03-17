const moment = require("moment");
const chalk = require("chalk");

const clk = new chalk.constructor({ enabled: true });

module.exports = (data, type = "log") => {
  switch (type.toLowerCase()) {
    case "debug":
      console.log(`${clk.bgMagenta(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
    case "warn":
      console.warn(`${clk.black.bgYellow(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
    case "error":
      console.error(`${clk.bgRed(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data.stack || data}`);
      break;
    case "log":
      console.log(`${clk.bgBlue(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
      // no default
  }
};
