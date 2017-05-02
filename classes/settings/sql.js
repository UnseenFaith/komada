const Base = require("./base.js");

class SQL extends Base {
  constructor(client) {
    super();
    Object.defineProperty(this, "client", { value: client });
  }


  fetch(guild) {
    const someSettings = {};
    return super().fetch(guild, someSettings);
  }
}
