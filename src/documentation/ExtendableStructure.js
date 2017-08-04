/**
 * Extendables allow you to "extend" native Discord.js classes with functions that you can use.
 * @module Extendable
 * @example <caption> They will always follow this structure. </caption>
 * exports.extend = function() { // code here };
 * exports.conf = {};
 */

/**
 * The part of the extendable that is added to the class.
 * @example <caption> This will create an extendable that replies to the author of the message with "Pong!" </caption>
 * exports.extend = function() {
 *   return this.reply("Pong!"); // The keyword 'this' refers to a Message Object.
  * }
 */
exports.extend = function() {}; // eslint-disable-line


/**
 * An Object containing configuration values that will configure an extendable.
 * @typedef {Object} Conf
 * @property {String} type Type of extendable. This will be one of the three: "method", "set", or "get".
 * @property {String} method The name of this extendable.
 * @property {Array} appliesTo An array of Discord.js classes that this extendable will apply to.
 */


/**
 * An object that configures the extendable.
 * @type {Conf}
 * @example <caption> When applied to Message, this would be accessed via <MessageObject>.ping(); </caption>
 * exports.conf = {
   type: "method",
   method: "ping",
   appliesTo: ["Message"]
 };
 */
exports.conf = {};
