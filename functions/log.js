const moment = require("moment");
const chalk = require("chalk");
const inspect = require("util").inspect;

const clk = new chalk.constructor({ enabled: true });

module.exports = (data, type = "log") => {
  switch (type.toLowerCase()) {
    case "debug":
      console.log(`${clk.bgMagenta(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${inspect(data)}`);
      break;
    case "warn":
      console.warn(`${clk.black.bgYellow(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${inspect(data, { depth: 5 })}`);
      break;
    case "error":
      console.error(`${clk.bgRed(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${inspect(data, { depth: 5 })}`);
      break;
    case "log":
      console.log(`${clk.bgBlue(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${inspect(data, { depth: 0 })}`);
      break;
      // no default
  }
};
