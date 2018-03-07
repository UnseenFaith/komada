const Key = require("./Key");
const Resolver = require("./Resolver");

class String extends Key {

  async resolve(data, guild, { min, max }) {
    const result = await Resolver.string(data);
    Key.maxOrMin(result.length, min, max).catch((e) => { throw `The string length must be ${e} characters.`; });
    return result;
  }

}

module.exports = String;
