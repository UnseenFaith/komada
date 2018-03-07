const Key = require("./Key");
const Resolver = require("./Resolver");

class Role extends Key {

  async resolve(data, guild) {
    const result = await Resolver.role(data, guild) || guild.roles.find("name", data);
    if (!result) throw "This key expects a Role Object or ID.";
    return result;
  }

}

module.exports = Role;
