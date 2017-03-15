/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */

const fs = require("fs-extra-promise");
const path = require("path");

/** The starting point for creating a Boolean configuration key. */
class BooleanConfig {
  /**
   * @param {Config} conf A guilds configuration obtained from the guildConfs map.
   * @param {Object} data The data you want to append to this boolean key.
   * @returns {BooleanConfig}
   */
  constructor(conf, data) {
    if (typeof data !== "boolean") this.data = false;
    else this.data = data;
    this.type = "Boolean";
    Object.defineProperty(this, "_id", { value: conf._id });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    return this;
  }

  /**
   * Toggles a boolean statement for the boolean key.
   * @returns {BooleanConfig}
   */
  toggle() {
    if (this.data === true) this.data = false;
    else this.data = true;
    fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }
}

module.exports = BooleanConfig;
