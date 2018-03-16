const Schema = require("./Schema");

class Persistent extends Schema {

  constructor(client) {
    super();
    Object.defineProperty(this, "client", { value: client });
  }

}

module.exports = Persistent;
