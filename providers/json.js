const { sep, resolve } = require("path");
const fs = require("fs-nextra");

let baseDir;

exports.init = (client) => {
  baseDir = resolve(`${client.clientBaseDir}${sep}bwd${sep}conf`);
  return fs.ensureDir(baseDir).catch(err => client.emit("log", err, "error"));
};

  /* Table methods */

  /**
   * Checks if a directory exists.
   * @param {string} table The name of the table you want to check.
   * @returns {Promise<boolean>}
   */
exports.hasTable = table => fs.pathExists(baseDir + sep + table);

  /**
   * Creates a new directory.
   * @param {string} table The name for the new directory.
   * @returns {Promise<Void>}
   */
exports.createTable = table => fs.mkdir(baseDir + sep + table);

  /**
   * Recursively deletes a directory.
   * @param {string} table The directory's name to delete.
   * @returns {Promise<Void>}
   */
exports.deleteTable = table => fs.emptyDir(baseDir + sep + table + sep).then(() => fs.remove(baseDir + sep + table + sep));

  /* Document methods */

  /**
   * Get all documents from a directory.
   * @param {string} table The name of the directory to fetch from.
   * @returns {Promise<Object[]>}
   */
exports.getAll = (table) => {
  const dir = baseDir + sep + table + sep;
  return fs.readdir(dir)
    .then(files => Promise.all(files.map(file => fs.readJSON(dir + file).then(d => Object.assign(d, { id: file.replace(/\.json/, "") })))));
};

  /**
   * Get a document from a directory.
   * @param {string} table The name of the directory.
   * @param {string} document The document name.
   * @returns {Promise<?Object>}
   */
exports.get = (table, document) => fs.readJSON(`${baseDir + sep + table + sep + document}.json`).then(d => Object.assign(d, { id: document })).catch(() => null);

  /**
   * Get a random document from a directory.
   * @param {string} table The name of the directory.
   * @returns {Promise<Object>}
   */
exports.getRandom = table => this.all(table).then(data => data[Math.floor(Math.random() * data.length)]);

  /**
   * Insert a new document into a directory.
   * @param {string} table The name of the directory.
   * @param {string} document The document name.
   * @param {Object} data The object with all properties you want to insert into the document.
   * @returns {Promise<Void>}
   */
exports.create = (table, document, data) => fs.outputJSON(`${baseDir + sep + table + sep + document}.json`, data);

  /**
   * Update a document from a directory.
   * @param {string} table The name of the directory.
   * @param {string} document The document name.
   * @param {Object} data The object with all the properties you want to update.
   * @returns {Promise<Void>}
   */
exports.update = (table, document, data) => this.get(table, document)
  .then(current => fs.outputJSON(`${baseDir + sep + table + sep + document}.json`, Object.assign(current, data)));

  /**
   * Delete a document from the table.
   * @param {string} table The name of the directory.
   * @param {string} document The document name.
   * @returns {Promise<Void>}
   */
exports.delete = (table, document) => fs.unlink(`${baseDir + sep + table + sep + document}.json`);

exports.conf = {
  moduleName: "json",
  enabled: true,
  requiredModules: [],
};

exports.help = {
  name: "json",
  type: "providers",
  description: "Allows you to use JSON functionality throught Komada",
};
