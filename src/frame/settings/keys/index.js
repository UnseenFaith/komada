 module.exports
  .add(require("./Boolean"))
  .add(require("./Float"))
  .add(require("./Guild"))
  .add(require("./Integer"))
  .add(require("./Role"))
  .add(require("./String"))
  .add(require("./TextChannel"))
  .add(require("./User"))
  .add(require("./VoiceChannel"));

Object.defineProperty(module.exports, "base", {
  get() { return require("./Key"); },
});

Object.defineProperty(module.exports, "types", {
  value: [],
});

module.exports.add = (extClass) => {
  if (Object.getPrototypeOf(extClass) !== this.base) throw new TypeError(`The class ${extClass.name} does not extend the Base Key class.`);
  if (this[extClass.name]) console.warn("You are overriding a default key. Unless this is what you want to do, consider changing the name of your key.");
  this[extClass.name] = extClass;
  this.types.push(extClass.name);
  return this;
};
