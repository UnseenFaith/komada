const { Collection } = require("discord.js");

exports.database = new Collection();

exports.getTable = table => this.database.get(table) || this.database.set(table, new Collection()).get(table);

exports.getAll = (table) => Array.from(this.getTable(table).values());

exports.get = (table, id) => {
  const collection = this.getTable(table);
  return collection.get(id) || [];
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
