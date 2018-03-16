const PersistentSchema = require("./PersistentSchema");
const Schema = require("./Schema");

class SchemaStorage {

  add({ name, persistent = false } = {}) {
    if (!name) throw new TypeError("You must provide a name for this new schema instancec.");
    this[name] = persistent ? new PersistentSchema() : new Schema();
    return this[name];
  }

}

module.exports = SchemaStorage;
