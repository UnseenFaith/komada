/**
 * Monitor are functions that are designed to watch incoming messages. These can range from
 * checking a message for specific words, or logging all mentions to a channel.
 * @module Monitor
 * @example <caption> They will always follow this structure. </caption>
 * exports.run = (client, msg) => { // code here };
 * exports.conf = {};
 */

/**
 * The part of the monitor that will run on the message.
 * @param  {KomadaClient}  client The Komada Client
 * @param  {Message}  msg A Message object obtained from discord.js
 * @example <caption> This will create a monitor that logs every message that mentions the bot. </caption>
 * exports.run = (client, msg, cmd) => {
 *   if (msg.mentions.users.has(client.user.id)) console.log(`Message ${msg.id} contained the bots mention: ${msg.cleanContent}`);
 * }
 */
exports.run = (client, msg) => {}; // eslint-disable-line


/**
 * An Object containing configuration values that will configure a monitor.
 * @typedef {Object} Conf
 * @property {Boolean} enabled Whether or not this monitor should be enabled for use.
 * @property {Boolean} ignoreBots Whether or not this monitor should ignore other bots.
 * @property {Boolean} ignoreSelf Whether or not this monitor should ignore messages from the ClientUser.
 */


/**
 * An object that configures the monitor.
 * @type {Conf}
 * @example
 * exports.conf = {
   enabled: true,
   ignoreBots: true,
   ignoreSelf: true
 };
 */
exports.conf = {};
