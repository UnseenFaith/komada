/**
 * Events are the same as they are in discord.js with the excecption of one thing: we pass client to every event.
 * @module Event
 * @example <caption> They will always follow this structure. You will always name the file the event you are trying to use. ex: ready event : ready.js </caption>
 * exports.run = (client, ...args) => { // code here };
 */

/**
 * The part of the extendable that is added to the class.
 * @param {KomadaClient} client The Komada client
 * @param {Array} args The arguments normally given to the Discord.js event.
 * @example <caption> This will create a ready event that sets the status to the below string. You would name this "ready.js" </caption>
 * exports.run = (client) => {
 *   client.user.setStatus(`Komada | ${require("komada").version} `);
 * }
 */
exports.run = (client, ...args) => {}; // eslint-disable-line
