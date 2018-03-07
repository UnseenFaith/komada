const Key = require("./Key");
const Resolver = require("./Resolver");

class User extends Key {

  async resolve(data) {
    const result = await Resolver.user(data);
    if (!result) throw "This key expects a User Object or ID.";
    return result;
  }

}

module.exports = User;
