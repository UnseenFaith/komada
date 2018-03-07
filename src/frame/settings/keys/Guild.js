const Key = require("./Key");
const Resolver = require("./Resolver");

class Guild extends Key {

  async resolve(data) {
    const result = await Resolver.guild(data);
    if (!result) throw "This key expects a Guild ID.";
    return result;
  }

}

module.exports = Guild;
