/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */

const fs = require("fs-extra-promise");
const path = require("path");
const dataDir = require("../Config.js").dataDir;
const guildConfs = require("../Config.js").guildConfs;

/** The starting point for creating a Boolean configuration key. */
class BooleanConfig {
  /**
   * @param {Config} conf A guilds configuration obtained from the guildConfs map.
   * @param {object} data The data you want to append to this boolean key.
   * @returns {BooleanConfig}
   */
  constructor(conf, data) {
    if (typeof data !== "boolean") this.data = false;
    else this.data = data;
    this.type = "Boolean";
    Object.defineProperty(this, "_id", { value: conf._id });
    return this;
  }

  /**
   * Toggles a boolean statement for the boolean key.
   * @returns {BooleanConfig}
   */
  toggle() {
    if (this.data === true) this.data = false;
    else this.data = true;
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return this;
  }
}

module.exports = BooleanConfig;
