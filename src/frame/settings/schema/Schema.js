const Keys = require("../keys");

class Schema extends Base {

  constructor() {
    Object.defineProperty(this, "keyArray", { value: [] });
  }
  /**
    * @param {KeyOptions} [options={}] The options for this key.
    * @returns {Schema}
    */
  add(options = {}) {}

  delete() {}

  toJSON() {
    return this.keyArray.map(k => JSON.stringify(this[k]));
  }

}

module.exports = Schema;
