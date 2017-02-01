/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */

const fs = require("fs-extra-promise");
const path = require("path");

/** The starting point for creating a String configuration key. */
class StringConfig {
  /**
   * @param {Config} conf The guild configuration obtained from the guildConfs map.
   * @param {Object} data The data you want to append to this String configuration key.
   * @returns {StringConfig}
   */
  constructor(conf, data) {
    if (typeof data !== "string") this.data = "";
    else this.data = data;
    this.type = "String";
    if (data.possibles) this.possibles = data.possibles;
    else this.possibles = [];
    Object.defineProperty(this, "_id", { value: conf._id });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    return this;
  }

  /**
   * Sets the value of a string configurations possibles. This takes into account the list of acceptable answers from the possibles array.
   * @param {String} value The value you want to set this key to.
   * @returns {StringConfig}
   */
  set(value) {
    if (!value) return "Please supply a value to set.";
    if (this.possibles.length !== 0 && !this.possibles.includes(value)) return `That is not a valid option. Valid options: ${this.possibles.join(", ")}`;
    this.data = value.toString();
    fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }

  /**
   * Adds a value(s) to list of acceptable answers for this key. Accepts one item or an array of items.
   * @param {String|Array} value The value(s) you want to add to this key.
   * @returns {StringConfig}
   */
  add(value) {
    if (!value) return "Please supply a value to add to the possibles array.";
    if (value instanceof Array) {
      value.forEach((val) => {
        if (this.possibles.includes(val)) return `The value ${val} is already in ${this.possibles}.`;
        return this.possibles.push(val);
      });
      fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
      return this;
    }
    if (this.possibles.includes(value)) return `The value ${value} is already in ${this.possibles}.`;
    this.possibles.push(value);
    fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }

  /**
   * Deletes a value(s) from the string configurations possibles. Accepts one item or an array of items.
   * @param {String|Array} value The value(s) you want to delete from this key.
   * @returns {StringConfig}
   */
  del(value) {
    if (!value) return "Please supply a value to add to the possibles array";
    if (value instanceof Array) {
      value.forEach((val) => {
        if (!this.possibles.includes(val)) return `The value ${value} is not in ${this.possibles}.`;
        return this.possibles.splice(this.possibles.indexOf(val), 1);
      });
      fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
      return this;
    }
    if (!this.possibles.includes(value)) return `The value ${value} is not in ${this.possibles}.`;
    this.possibles.splice(this.possibles.indexOf(value), 1);
    fs.outputJSONAsync(path.resolve(`${this._dataDir}${path.sep}${this._id}.json`), this._client.guildConfs.get(this._id));
    return this;
  }
}

module.exports = StringConfig;
