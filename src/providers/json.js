const { resolve } = require("path");
const fs = require("fs-nextra");

let baseDir;

exports.init = (client) => {
  if (baseDir) return null;
  baseDir = resolve(client.clientBaseDir, "bwd", "provider", "json");
  return fs.ensureDir(baseDir).catch(err => client.emit("log", err, "error"));
};

exports.hasTable = table => fs.pathExists(resolve(baseDir, table));

exports.createTable = table => fs.mkdir(resolve(baseDir, table));

exports.deleteTable = table => this.hasTable(table)
  .then(exists => (exists ? fs.emptyDir(resolve(baseDir, table)).then(() => fs.remove(resolve(baseDir, table))) : null));

exports.getAll = (table) => {
  const dir = resolve(baseDir, table);
  return fs.readdir(dir)
    .then(files => Promise.all(files.map(file => fs.readJSON(resolve(dir, file)))));
};

exports.get = (table, document) => fs.readJSON(resolve(baseDir, table, `${document}.json`)).catch(() => null);

exports.has = (table, document) => fs.pathExists(resolve(baseDir, table, `${document}.json`));

exports.getRandom = table => this.getAll(table).then(data => data[Math.floor(Math.random() * data.length)]);

exports.create = (table, document, data) => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), Object.assign(data, { id: document }));
exports.set = (...args) => this.create(...args);
exports.insert = (...args) => this.create(...args);

exports.update = (table, document, data) => this.get(table, document)
  .then(current => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), Object.assign(current, data)));

exports.replace = (table, document, data) => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), data);

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
