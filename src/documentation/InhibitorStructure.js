/**
 * Inhibitors are functions that are designed to prevent or allow a user to run a command. These can range from
 * checking a users specific permission level to checking if the user is on cooldown.
 * @module Inhibitor
 * @example <caption> They will always follow this structure. </caption>
 * exports.run = (client, msg, cmd) => { // code here };
 * exports.conf = {};
 */

/**
 * The part of the inhibitor that will determine if the user can use the command or not. This function must return one of three things. <br>
 * If the user should be allowed to use the command, you will return false. <br>
 * If the user should prevented from using the command, you will return true. If you do this, the command will be silent. <br>
 * However, if you would like to give the user a message as to why they couldn't use the command, you can also return a String, such as `return "Not enough permissions to use this command."`.
 * @param  {KomadaClient}  client The Komada Client
 * @param  {Message}  msg A Message object obtained from discord.js
 * @param  {Command}  cmd The command that the user is trying to run.
 * @example <caption> This will create an inhibitor that only runs when the commands "requiredUser" configuration property has the message authors id in it. </caption>
 * exports.run = (client, msg, cmd) => {
 *  if (!cmd.conf.requiredUser || !(cmd.conf.requiredUser instanceof Array) || cmd.conf.requiredUser.length === 0) return false;
 *  if (cmd.conf.requiredUser.includes(message.author.id)) return false;
 *  return "You are not allowed to use this command.";
 * }
 * @return {string|boolean}
 */
exports.run = (client, msg, cmd) => ({}); // eslint-disable-line


/**
 * An Object containing configuration values that will configure a inhibitor.
 * @typedef {Object} Conf
 * @property {Boolean} enabled Whether or not this inhibitor should be enabled for use.
 * @property {Number} priority The priority of this inhibitor. **This will probably be removed in the future**
 * @property {Boolean} spamProtection Whether or not we should run this inhibitor in other places, like the help menu.
 */


/**
 * An object that configures the inhibitor.
 * @type {Conf}
 * @example
 * exports.conf = {
   enabled: true,
   priority: 0,
   spamProtection: false
 };
 */
exports.conf = {};
