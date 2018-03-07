const Key = require("./Key");
const Resolver = require("./Resolver");

class TextChannel extends Key {

  async resolve(data) {
    const result = await Resolver.channel(data);
    if (result.type !== "text") throw "This key expects a TextChannel Object or ID.";
    return result;
  }

}

module.exports = TextChannel;
