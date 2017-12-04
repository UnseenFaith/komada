/**
 * Finalizers are functions that are ran after a Command has successfully been ran. Examples of these are
 * cooldown setting after a command is ran and command logging.
 * @module Finalizer
 * @example <caption> They will always follow this structure. </caption>
 * exports.run = (client, msg, mes) => { // code here };
 * exports.conf = {};
 */

/**
 * The part of the monitor that will run on the message.
 * @param {KomadaClient}  client The Komada Client
 * @param {Message}  msg A Message object obtained from discord.js
 * @param {?} [mes] Something returned from the command for use in finalizers, like a message.
 * @example <caption> This will create a finalizer that logs commands. </caption>
 * exports.run = (client, msg, cmd) => {
 *   console.log(`Message ${msg.id} contained the command ${cmd.help.name} and was ran with the arguments ${msg.args.join(",")}`);
 * }
 */
exports.run = (client, msg, mes) => {}; // eslint-disable-line


/**
 * An Object containing configuration values that will configure a monitor.
 * @typedef {Object} Conf
 * @property {Boolean} enabled Whether or not this monitor should be enabled for use.
 */


/**
 * An object that configures the monitor.
 * @type {Conf}
 * @example
 * exports.conf = {
   enabled: true,
 };
 */
exports.conf = {};
