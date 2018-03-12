module.exports = {
  Boolean: require("./Boolean"),
  Float: require("./Float"),
  Guild: require("./Guild"),
  Integer: require("./Integer"),
  Role: require("./Role"),
  String: require("./String"),
  TextChannel: require("./TextChannel"),
  User: require("./User"),
  VoiceChannel: require("./VoiceChannel"),
};

Object.defineProperty(module.exports, "base", {
  get() { return require("./Key"); },
});

module.exports.add = (extClass) => {
  if (Object.getPrototypeOf(extClass) !== this.base) throw new TypeError(`The class ${extClass.name} does not extend the Base Key class.`);
  if (this[extClass.name]) console.warn("You are overriding a default key. Unless this is what you want to do, consider changing the name of your key.");
  this[extClass.name] = extClass;
  return this;
};
