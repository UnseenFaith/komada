const { resolve } = require("path");
const fs = require("fs-nextra");


/** A provider that gives you the ability to manipulate JSON data and files throughout Komada.
 * @namespace Providers#JSON
 * @type {Provider}
 */


let baseDir;

/**
 * Initializes the provider after Komada is ready to start seeing Discord Data.
 * @memberof Providers#JSON
 * @param  {KomadaClient} client The Komada client.
 * @return {*}
 */
exports.init = (client) => {
  if (baseDir) return null;
  baseDir = resolve(client.clientBaseDir, "bwd", "provider", "json");
  return fs.ensureDir(baseDir).catch(err => client.emit("log", err, "error"));
};


/**
 * Checks if a directory exists.
 * @memberof Providers#JSON
 * @param {string} table The name of the table you want to check.
 * @returns {Promise<boolean>}
 */
exports.hasTable = table => fs.pathExists(resolve(baseDir, table));

/**
 * Creates a new directory.
 * @memberof Providers#JSON
 * @param {string} table The name for the new directory.
 * @returns {Promise<Void>}
 */
exports.createTable = table => fs.mkdir(resolve(baseDir, table));

/**
 * Recursively deletes a directory.
 * @memberof Providers#JSON
 * @param {string} table The directory's name to delete.
 * @returns {Promise<Void>}
 */
exports.deleteTable = table => this.hasTable(table)
  .then(exists => (exists ? fs.emptyDir(resolve(baseDir, table)).then(() => fs.remove(resolve(baseDir, table))) : null));


/**
 * Get all documents from a directory.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory to fetch from.
 * @returns {Promise<Object[]>}
 */
exports.getAll = (table) => {
  const dir = resolve(baseDir, table);
  return fs.readdir(dir)
    .then(files => Promise.all(files.map(file => fs.readJSON(resolve(dir, file)))));
};

/**
 * Get a document from a directory.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<?Object>}
 */
exports.get = (table, document) => fs.readJSON(resolve(baseDir, table, `${document}.json`)).catch(() => null);

/**
 * Check if the document exists.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<boolean>}
 */
exports.has = (table, document) => fs.pathExists(resolve(baseDir, table, `${document}.json`));

/**
 * Get a random document from a directory.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @returns {Promise<Object>}
 */
exports.getRandom = table => this.getAll(table).then(data => data[Math.floor(Math.random() * data.length)]);

/**
 * Insert a new document into a directory.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The object with all properties you want to insert into the document.
 * @returns {Promise<Void>}
 */
exports.create = (table, document, data) => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), Object.assign(data, { id: document }));
exports.set = (...args) => this.create(...args);
exports.insert = (...args) => this.create(...args);

/**
 * Update a document from a directory.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The object with all the properties you want to update.
 * @returns {Promise<Void>}
 */
exports.update = (table, document, data) => this.get(table, document)
  .then(current => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), Object.assign(current, data)));

/**
 * Replace all the data from a document.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The new data for the document.
 * @returns {Promise<Void>}
 */
exports.replace = (table, document, data) => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), data);

/**
 * Delete a document from the table.
 * @memberof Providers#JSON
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<Void>}
 */
exports.delete = (table, document) => fs.unlink(resolve(baseDir, table, `${document}.json`));

exports.conf = {
  moduleName: "json",
  enabled: true,
  requiredModules: ["fs-nextra"],
};

exports.help = {
  name: "json",
  type: "providers",
  description: "Allows you to use JSON functionality throught Komada",
};
