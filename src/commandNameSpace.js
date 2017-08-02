/**
 * All commands will follow this similar structure. It doesn't matter what order they are in.
 * @module Command
 * @example
 * exports.run = async (client, msg, ...args) => { // code here };
 * exports.help = {};
 * exports.conf = {};
 */

/**
 * The part of the command that will run. This should always return a Promise to prevent issues in Komada. The easy way to do this is to add the async keyword.
 * @param  {KomadaClient}  client The Komada Client
 * @param  {Message}  msg A Message object obtained from discord.js
 * @param  {Array}  args An array of arguments passed through by our argument parser.
 * @example
 * exports.run = (client, msg) => msg.reply("Hello Komada!");
 * @return {Promise}
 */
exports.run = async (client, msg, ...args) => ({}); // eslint-disable-line


/**
 * An object containing help information that will help identify and use a command.
 * @typedef {Object} Help
 * @property {String} name The name of the command
 * @property {String} description The description displayed in the help
 * @property {String} usage A usage string that denotes how the command should be used.
 * @property {String} usageDelim A character(s) to split the message content by and determine arguments.
 */

/**
 * The help object used throughout komada
 * @type {Help}
 * @example
 * exports.help = {
   name: "ping",
   description: "Ping/Pong command. I wonder what this does? /sarcasm",
   usage: "",
   usageDelim: "",
 };
 */
exports.help = {};

/**
 * An Object containing configuration values that will configure a command.
 * @typedef {Object} Conf
 * @property {Boolean} enabled Whether or not this command should be enabled for use.
 * @property {Array} runIn What type of text channels this command should run in.
 * @property {Array} aliases An array of names that will also trigger this command.
 * @property {Number} permLevel What permission level this command should be limited to.
 * @property {Array} botPerms What permissions the bot must have to run this command.
 * @property {Array} requiredFuncs What functions are required in the bot to run this command.
 * @property {Array} requiredSettings What settings are required in the default schema to run this command.
 */


/**
 * An object that configures the command.
 * @type {Conf}
 * @example
 * exports.conf = {
   enabled: true,
   runIn: ["text", "dm", "group"],
   aliases: [],
   permLevel: 0,
   botPerms: [],
   requiredFuncs: [],
   requiredSettings: [],
 };
 */
exports.conf = {};
