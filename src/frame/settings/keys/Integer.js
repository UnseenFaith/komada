const Key = require("./Key");
const Resolver = require("./Resolver");

class Integer extends Key {

  async resolve(data, guild, { min, max }) {
    const result = await Resolver.integer(data);
    Key.maxOrMin(result.length, min, max).catch((e) => { throw `The string length must be ${e} characters.`; });
    return result;
  }

}

module.exports = Integer;
