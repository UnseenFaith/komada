/**
 * A helper class for building valid permission Structures
 */
class PermissionLevels {

  /**
   * @typedef {object} permLevel
   * @memberof PermissionLevels
   * @property {boolean} break Whether the level should break (stop processing higher levels, and inhibit a no permission error)
   * @property {Function} check The permission checking function
   */

  /**
   * Creates a new PermissionLevels instance.
   * Note that constructing any PermissionLevel instance will always insert a "Owner only" level for you
   * at the highest number you specify automatically. You can still however remove this and change it after
   * constructing.
   * @param  {number} [size=10] The number of levels you want to allocate for this PermissionLevels instance
   */
  constructor(size = 10) {
    const s = parseInt(size);
    if (typeof s !== "number" || size < 0) throw new Error("Size must be a valid integer above zero.");

    /**
     * The number of permission levels allowed in this instance.
     * Technically this will be the size you input + 1 since Array[0] would be Level 0
     * @type {number}
     */
    this.size = s;

    /**
     * Cached array of levels that get used for determining permissions.
     * @type {Array}
     */
    this.levels = [].fill({ break: false, check: () => false }, 0, s);
    this.levels[size] = { break: false, check: (client, msg) => client.user === msg.author };
  }

  /**
   * Adds levels to the levels array to be used in your bot.
   * @param {number} level The permission number for the level you are defining
   * @param {boolean} brk Whether the level should break (stop processing higher levels, and inhibit a no permission error)
   * @param {Function} check The permission checking function
   * @returns {PermissionLevels} This permission levels
   */
  add(level, brk, check) {
    if (level > this.size) throw new Error(`Level ${level} is higher then the allocated amount (${this.size}) of levels.`);
    if (typeof brk !== "boolean") throw new Error("Break must be a boolean value.");
    if (typeof check !== "function") throw new Error("Check must be a function.");
    this.levels[level] = { break: brk, check };
    return this;
  }

  /**
   * Resets a level back to the default permission object.
   * @param {number} level The level you want to reset.
   * @returns {PermissionLevels} This permission levels.
   */
  reset(level) {
    this.levels[level] = { break: false, check: () => false };
    return this;
  }

}

module.exports = PermissionLevels;
