const Keys = require("../keys");

class Schema {

  constructor() {
    Object.defineProperty(this, "keyArray", { value: [] });
  }

}

module.exports = Schema;
