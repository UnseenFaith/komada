/**
 * Providers are special pieces that give you easy access to various data storage systems
 * using a consistent and predictable set of methods
 * @module Provider
 * @example <caption> The following structure is needed for SettingGateway compatibility. </caption>
 * exports.hasTable = (table) => { // code here };
 * exports.createTable = (table) => { // code here };
 * exports.getAll = (table) => { // code here };
 * exports.get = (table, id) => { // code here };
 * exports.create = (table, id, document) => { // code here };
 * exports.delete = (table, id) => { // code here };
 * exports.update = (table, id, document) => { // code here };
 * exports.replace = (table, id, document) => { // code here };
 * exports.conf = {};
 */

/**
 * Checks if a table exists.
 * @param {string} table The name of the table you want to check.
 * @return {Promise<boolean>}
 */
exports.hasTable = (table) => ({}); // eslint-disable-line

/**
 * Create a new table.
 * @param {string} table The name for the new table.
 * @return {Promise<*>}
 */
exports.createTable = (table) => ({}); // eslint-disable-line

/**
 * Get all entries from a table.
 * @param {string} table The name of the table to fetch from.
 * @return {Promise<Array<{}>>}
 */
exports.getAll = (table) => ({}); // eslint-disable-line

/**
 * Get an entry from a table.
 * @param {string} table The name of the table to fetch from.
 * @param {string} id The ID of the entry to get.
 * @return {Promise<Array<{}>>}
 */
exports.get = (table, id) => ({}); // eslint-disable-line

/**
 * Create a new entry into a table.
 * @param {string} table The name of the table to update.
 * @param {string} id The ID for the new entry.
 * @param {Object} document A JSON object.
 * @return {Promise<*>}
 */
exports.create = (table, id, document) => ({}); // eslint-disable-line

/**
 * Delete an entry from a table.
 * @param {string} table The name of the table to update.
 * @param {string} id The ID of the entry to delete.
 * @return {Promise<Array<{}>>}
 */
exports.delete = (table, id) => ({}); // eslint-disable-line

/**
 * Update an entry from a table.
 * @param {string} table The name of the table to update.
 * @param {string} id The ID of the entry to update.
 * @param {Object} document A JSON object.
 * @return {Promise<*>}
 */
exports.update = (table, id, document) => ({}); // eslint-disable-line

/**
 * Replace an entry from a table.
 * @param {string} table The name of the table to update.
 * @param {string} id The ID of the entry to update.
 * @param {Object} document The new JSON object for the document.
 * @return {Promise<*>}
 */
exports.replace = (table, id, document) => ({}); // eslint-disable-line

/**
 * An object that configures the provider.
 * @type {Conf}
 * @example
 * exports.conf = {
 *   enabled: true,
 *   moduleName: "json",
 *   priority: 0
 * };
 */
exports.conf = {};

/**
 * Some providers are SQL, and due to the No-SQL environment that exists in SettingGateway,
 * they require extra methods/properties to work. All the previous methods are required to work.
 * @module ProviderSQL
 * @example <caption> SQL Compatibility </caption>
 * exports.updateColumns = (table, columns, schema) => { // code here };
 * exports.serialize = (data) => { // code here };
 * exports.sanitize = (string) => { // code here };
 * exports.CONSTANTS = {};
 */

/**
 * Update the columns from a table (All the data is provided by the SQL class).
 * @param {string} table The name of the table.
 * @param {string[]} columns Array of columns.
 * @param {array[]} schema Tuples of keys/values from the schema.
 * @returns {boolean}
 */
exports.updateColumns = (table, columns, schema) => ({}); // eslint-disable-line

/**
 * Transform NoSQL queries into SQL.
 * @param {Object} data The object.
 * @returns {Object}
 */
exports.serialize = (data) => ({}); // eslint-disable-line

/**
 * Sanitize strings to be storable into the SQL database.
 * @param {*} string An object or string.
 * @returns {string}
 */
exports.sanitize = (string) => ({}); // eslint-disable-line

/**
 * An object that helps the SQL class creating compatible schemas for the provider.
 * @property {string} String The SQL compatible string datatype.
 * @property {string} Integer The SQL compatible integer datatype.
 * @property {string} Float The SQL compatible float datatype.
 * @example
 * exports.CONSTANTS = {
 *   String: "TEXT",
 *   Integer: "INTEGER",
 *   Float: "INTEGER",
 *   AutoID: "INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
 *   Timestamp: "DATETIME",
 *   AutoTS: "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
 * };
 */
exports.CONSTANTS = {};
