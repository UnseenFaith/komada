/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */

const fs = require("fs-extra-promise");
const path = require("path");
const dataDir = require("../Config.js").dataDir;
const guildConfs = require("../Config.js").guildConfs;

/** The starting point for creating a Number configuration key. */
class NumberConfig {
  /**
   * @param {Config} conf A guilds configuration obtained from the guildConfs map.
   * @param {object} data The data you want to append to this number key.
   * @returns {NumberConfig}
   */
  constructor(conf, data) {
    if (typeof data !== "number") this.data = 0;
    else this.data = data;
    if (data.min) this.min = data.min;
    if (data.max) this.max = data.max;
    this.type = "Number";
    Object.defineProperty(this, "_id", { value: conf._id });
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
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return this;
  }

  /**
   * Sets the minimum value a number key can be.
   * @param {number} value The value you want to set the minimum as.
   * @returns {NumberConfig}
   */
  setMin(value) {
    this.min = value;
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return this;
  }

  /**
   * Sets the maximum value a number key can bey.
   * @param {number} value The value you want to set the maximum as.
   * @returns {NumberConfig}
   */
  setMax(value) {
    this.max = value;
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return this;
  }
}

module.exports = NumberConfig;
