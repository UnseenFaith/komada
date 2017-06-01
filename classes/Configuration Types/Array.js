/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */

const fs = require("fs-extra-promise");
const path = require("path");

/** The starting point for creating an Array Configuration key. */
class ArrayConfig {
  /**
   * @param {Config} conf The guild configuration obtained from the guildConfs map.
   * @param {Object} data The data you want to append to this Array configuration key.
   * @returns {ArrayConfig}
   */
  constructor(conf, data) {
    if (!(data instanceof Array)) this.data = [];
    else this.data = data;
    this.type = "Array";
    Object.defineProperty(this, "_id", { value: conf._id });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    return this;
  }

  /**
   * Adds a value(s) to the array. Accepts a single value or an array of values.
   * @param {String|Array} value The value(s) to add to the array.
   * @returns {ArrayConfig}
   */
  add(value) {
    if (!value) return "Please supply a value to add to the array.";
    if (value instanceof Array) {
      value.forEach((val) => {
        if (!this.data.includes(val)) return "That value is not in the array.";
        return this.data.splice(this.data.indexOf(value), 1);
      });
      fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
      return this;
    }
    if (this.data.includes(value)) return "That value is already in the array.";
    this.data.push(value);
    fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }

  /**
   * Deletes a value(s) from the array. Accepts a single value or an array of values.
   * @param {String|Array} value The value(s) to delete from the array.
   * @returns {ArrayConfig}
   */
  del(value) {
    if (!value) return "Please supply a value to delete from the array";
    if (value instanceof Array) {
      value.forEach((val) => {
        if (!this.data.includes(val)) return "That value is not in the array.";
        return this.data.splice(this.data.indexOf(value), 1);
      });
      fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
      return this;
    }
    if (!this.data.includes(value)) return "That value is not in the array.";
    this.data.splice(this.data.indexOf(value), 1);
    fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }
}

module.exports = ArrayConfig;
