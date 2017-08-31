const { Collection } = require("discord.js");

exports.database = new Collection();

const getTable = table => this.database.get(table) || this.database.set(table, new Collection());

exports.getAll = (table) => {
  const collection = this.database.get(table);
  return collection ? Array.from(collection.values()) : null;
};

exports.get = (table, id) => {
  const collection = this.getTable(table);
  return collection.get(id) || null;
};

exports.has = (table, id) => !!this.get(table, id);

exports.set = (table, id, data) => {
  const collection = this.getTable(table);
  return collection.set(id, data);
};

exports.delete = (table, id) => {
  const collection = this.getTable(table);
  return collection.delete(id);
};

exports.conf = {
  moduleName: "collection",
  enabled: true,
  requiredModules: [],
};