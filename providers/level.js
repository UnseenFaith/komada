const { sep, resolve } = require("path");
const fs = require("fs-nextra");
const level = require("level");
const promisify = require("then-levelup");

let baseDir;
let loaded;

/* eslint-disable no-confusing-arrow */
exports.init = (client) => {
  baseDir = resolve(client.clientBaseDir, "bwd", "provider", "level");
  loaded = new client.methods.Collection();
  fs.ensureDir(baseDir).catch(err => client.emit("log", err, "error"));
  fs.readdir(baseDir)
    .then(files => Promise.all(files.map(async (file) => {
      const db = await promisify(level(baseDir + sep + file));
      loaded.set(file, db);
      return file;
    })));
};

/* Table methods */

/**
 * Checks if a directory exists.
 * @param {string} table The name of the table you want to check.
 * @returns {Promise<boolean>}
 */
exports.hasTable = async table => loaded.has(table);

/**
 * Creates a new directory.
 * @param {string} table The name for the new directory.
 * @returns {Promise<Void>}
 */
exports.createTable = async (table) => {
  const db = await promisify(level(baseDir + sep + table));
  loaded.set(table, db);
  return null;
};

/**
 * Recursively deletes a directory.
 * @param {string} table The directory's name to delete.
 * @returns {Promise<Void>}
 */
exports.deleteTable = table => this.hasTable(table)
  .then(exists => exists ? level.destroy(baseDir + sep + table).then(() => fs.remove(baseDir + sep + table)) : null);

/* Document methods */

/**
 * Get all documents from a directory.
 * @param {string} table The name of the directory to fetch from.
 * @returns {Promise<Object[]>}
 */
exports.getAll = async (table) => {
  if (!loaded.has(table)) return {};
  return new Promise((res) => {
    const db = loaded.get(table);
    const returnValues = {};
    const stream = db.keyStream();
    stream.on("data", async (key) => {
      const value = await db.get(key);
      try {
        returnValues[key] = JSON.parse(value);
      } catch (e) {
        returnValues[key] = value;
      }
    });
    stream.on("end", () => {
      res(returnValues);
    });
  });
};

/**
 * Get a document from a directory.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<?Object>}
 */
exports.get = async (table, document) => loaded.get(table)[document];

/**
 * Insert a new document into a directory. Aliases: set, insert.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The object with all properties you want to insert into the document.
 * @returns {Promise<Void>}
 */
exports.create = (table, document, data) => loaded.get(table).set(document, data);
exports.set = (...args) => this.create(...args);
exports.insert = (...args) => this.create(...args);

/**
 * Update a document from a directory.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The object with all the properties you want to update.
 * @returns {Promise<Void>}
 */
exports.update = (table, document, data) => this.get(table, document)
  .then(current => this.set(table, document, Object.assign(current, data)));

/**
 * Replace all the data from a document.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The new data for the document.
 * @returns {Promise<Void>}
 */
exports.replace = (table, document, data) => this.set(table, document, data);

/**
 * Delete a document from the table.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<Void>}
 */
exports.delete = (table, document) => this.get(table, document)
  .then(db => db.delete(document));

/**
 * Closes all open database connections.
 * @returns {Array<Promise>}
 */
exports.shutdown = () => loaded.forEach(db => db.close());

exports.conf = {
  moduleName: "level",
  enabled: true,
  requiredModules: [],
};

exports.help = {
  name: "level",
  type: "providers",
  description: "Allows you to use LevelDB functionality throught Komada",
};
