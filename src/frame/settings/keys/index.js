class Keys {

  constructor() {
    this.Boolean = require("./Boolean");
    this.Float = require("./Float");
    this.Guild = require("./Guild");
    this.Integer = require("./Integer");
    this.Role = require("./Role");
    this.String = require("./String");
    this.TextChannel = require("./TextChannel");
    this.User = require("./User");
    this.VoiceChannel = require("./VoiceChannel");
  }

  get base() {
    return require("./Key");
  }

  add(extClass) {
    if (Object.getPrototypeOf(extClass) !== this.base) throw new TypeError(`The class ${extClass.name} does not extend the Base Key class.`);
    if (this[extClass.name]) console.warn("You are overriding a default key. Unless this is what you want to do, consider changing the name of your key.");
    this[extClass.name] = extClass;
  }

}

module.exports = Keys;
