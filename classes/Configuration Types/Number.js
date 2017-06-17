/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */

const { outputJSONAsync } = require("fs-extra-promise");
const { resolve, sep } = require("path");


/** The starting point for creating a Number configuration key. */
class NumberConfig {
  /**
   * @param {Config} conf A guilds configuration obtained from the guildConfs map.
   * @param {Object} data The data you want to append to this number key.
   * @returns {NumberConfig}
   */
  constructor(conf, data) {
    if (typeof data !== "number") this.data = 0;
    else this.data = data;
    if (data.min) this.min = data.min;
    if (data.max) this.max = data.max;
    this.type = "Number";
    Object.defineProperty(this, "_id", { value: conf._id });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    return this;
  }

  /**
   * Sets the value for a number key, according to the minimum and maximum values if they apply.
   * @param {number} value The value you want to set the key as.
   * @returns {NumberConfig}
   */
  set(value) {
    if (!value) return `Error, value is ${value}. Please supply a value to set.`;
    if (this.min && parseInt(value) < this.min) return `Error while setting the value. ${value} is less than ${this.min}`;
    if (this.max && parseInt(value) > this.max) return `Error while setting the value. ${value} is more than ${this.max}`;
    this.data = value;
    outputJSONAsync(resolve(`${this._dataDir}${sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }

  /**
   * Sets the minimum value a number key can be.
   * @param {number} value The value you want to set the minimum as.
   * @returns {NumberConfig}
   */
  setMin(value) {
    this.min = value;
    outputJSONAsync(resolve(`${this._dataDir}${sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }

  /**
   * Sets the maximum value a number key can bey.
   * @param {number} value The value you want to set the maximum as.
   * @returns {NumberConfig}
   */
  setMax(value) {
    this.max = value;
    outputJSONAsync(resolve(`${this._dataDir}${sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }
}

module.exports = NumberConfig;
