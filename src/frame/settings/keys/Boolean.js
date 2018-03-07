const Key = require("./Key");
const Resolver = require("./Resolver");

class Boolean extends Key {

  async resolve(data) {
    const result = await Resolver.boolean(data);
    if (typeof result !== "boolean") throw "This key expects a Boolean.";
    return result;
  }

}

module.exports = Boolean;
