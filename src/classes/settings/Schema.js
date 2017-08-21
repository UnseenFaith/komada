const Resolver = require("../settingResolver");

/* eslint-disable class-methods-use-this, no-underscore-dangle, no-restricted-syntax */
const types = Object.getOwnPropertyNames(Resolver.prototype).slice(1);

/**
 * Schema constructor that creates schemas for use in Komada.
 * @type {Object}
 */
class Schema {

/**
 * Constructs our schema that we can add into.
 * @param  {Object} [schema] An object containing key:value pairs
 */
  constructor(schema) {
    if (schema) {
      for (const [key, value] of Object.entries(schema)) {
        this[key] = value;
      }
    }
  }

  /**
   * All of the valid key types in Komada at the present moment.
   * @typedef {string} Types
   * @property {string} user
   * @property {string} channel
   * @property {string} textChannel
   * @property {string} voiceChannel
   * @property {string} guild
   * @property {string} role
   * @property {string} boolean
   * @property {string} string
   * @property {string} integer
   * @property {string} float
   * @property {string} url
   * @property {string} command
   * @memberof Schema
   */

  /**
   * @typedef {object} Options
   * @property {Schema.Types} type  The type of key you want to add
   * @property {?} value The default value to set the key to.
   * @property {number} min The minimum number, used for determining string length and amount for number types.
   * @property {number} max The maximum number, used for determining string length and amount for number types.
   * @property {boolean} Array A boolean indicating whether or not this key should be created and stored as an array.
   * @memberof Schema
   */

  /**
   * Add function that adds a new key into the schema. Only requires that you pass a name and type for the key.
   * @param {string} name The name of the key you want to add.
   * @param {Schema.Options} [options] An object containing extra options for a key.
   * @returns {Schema} Returns the schema you are creating so you can chain add calls.
   */
  add(name, { type, value, min, max, array } = {}) {
    [name, value, min, max, array, type] = this._validateInput(name, value, min, max, array, type.toLowerCase());
    if (type === "object") {
      this[name] = new Schema();
    }
    if (["float", "integer", "string"].includes(type)) {
      this[name] = { type, default: value, min, max, array };
      return this;
    }
    this[name] = { type, default: value, array };
    return this;
  }

  /**
   * Returns an object containing the keys mapped to their default values.
   * @return {Object}
   */
  get defaults() {
    const defaults = {};
    for (const key of Object.keys(this)) {
      defaults[key] = this[key].default;
    }
    return defaults;
  }

  _validateInput(name, value, min, max, array, type) {
    if (!name) throw "You must provide a name for this new key.";
    if (!types.includes(type)) throw `Invalid type provided. Valid types are: ${types.join(", ")}`;
    if (array) {
      if (array.constructor.name !== "Boolean") throw "The array parameter must be a boolean.";
      value = value || [];
      if (!Array.isArray(value)) throw "The default value must be an array if you set array to true.";
    } else {
      array = false;
      value = value || null;
    }
    if (min || max) [min, max] = this._minOrMax(value, min, max);
    return [name, value, min, max, array, type];
  }

  _minOrMax(value, min, max) {
    if (!value) return [min, max];
    if (!isNaN(min) && !isNaN(max)) {
      if (value >= min && value <= max) return [min, max];
      if (min === max) throw `Value must be exactly ${min}`;
      throw `Value must be between ${min} and ${max}`;
    } else if (!isNaN(min)) {
      if (value >= min) return [min, null];
      throw `Value must be longer than ${min}`;
    } else if (!isNaN(max)) {
      if (value <= max) return [null, max];
      throw `Value must be shorter than ${max}`;
    }
    return [null, null];
  }

}

module.exports = Schema;
