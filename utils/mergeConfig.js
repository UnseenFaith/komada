module.exports = (config) => {
  const merged = {};
  for (const prop in this.defaultConfig) {
    merged[prop] = this.defaultConfig[prop];
  }
  for (const prop in config) {
    merged[prop] = config[prop];
  }
  return merged;
};

exports.defaultConfig = {
  ignoreBots: true,
  ignoreSelf: true,
  editableCommands: false,
  commandPrompts: false,
  selfbot: false,
  clientID: null,
  ownerID: null,
};
