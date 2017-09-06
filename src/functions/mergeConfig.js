const PermLevels = require("../classes/permLevels");

const defaultPermStructure = new PermLevels()
  .addLevel(0, false, () => true)
  .addLevel(2, false, (client, msg) => {
    if (!msg.guild || !msg.guild.settings.modRole) return false;
    const modRole = msg.guild.roles.get(msg.guild.settings.modRole);
    return modRole && msg.member.roles.has(modRole.id);
  })
  .addLevel(3, false, (client, msg) => {
    if (!msg.guild || !msg.guild.settings.adminRole) return false;
    const adminRole = msg.guild.roles.get(msg.guild.settings.adminRole);
    return adminRole && msg.member.roles.has(adminRole.id);
  })
  .addLevel(4, false, (client, msg) => msg.guild && msg.author.id === msg.guild.owner.id)
  .addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
  .addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID);


module.exports = (options) => {
  for (const key in this.DEFAULT_OPTIONS) { // eslint-disable-line
    if (!(key in options)) options[key] = this.DEFAULT_OPTIONS[key];
  }
  this.validate(options);
  return options;
};

exports.DEFAULT_OPTIONS = {
  prefix: "?",
  ownerID: null,
  disabled: {
    commands: [],
    events: [],
    functions: [],
    inhibitors: [],
    finalizers: [],
    monitors: [],
    providers: [],
    extendables: [],
  },
  permStructure: defaultPermStructure,
  selfbot: false,
  readyMessage: client => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
  commandMessageLifetime: 1800,
  commandMessageSweep: 900,
  disableLogTimestamps: false,
  disableLogColor: false,
  cmdEditing: false,
  cmdPrompt: false,
  provider: {
    engine: "json",
    cache: "js",
  },
};

exports.validate = (options) => {
  const pieces = Object.keys(this.DEFAULT_OPTIONS.disabled);
  if ("prefix" in options && typeof options.prefix !== "string") throw new TypeError("Prefix must be a string value.");
  if ("ownerID" in options && typeof options.ownerID !== "string" && options.ownerID !== null) throw new TypeError("OwnerID must be a string (user id) if provided.");
  if ("disabled" in options) {
    if (typeof options.disabled !== "object" || Array.isArray(options.disabled)) throw new TypeError("Disabled must be a valid object");
    for (const key of Object.keys(options.disabled)) { // eslint-disable-line
      if (!pieces.includes(key)) throw new Error("Invalid piece name in the disabled array");
      if (!Array.isArray(options.disabled[key])) throw new TypeError(`${key} must be an array.`);
      Object.assign(options.disabled, this.DEFAULT_OPTIONS.disabled, Object.assign({}, options.disabled));
    }
  }
  if ("permStructure" in options) {
    if (options.permStructure.constructor.name !== "PermissionLevels" && !Array.isArray(options.permStructure)) throw new TypeError("PermStructure must be a valid array with 11 entries, or a instance of Komada.PermLevels");
  }
  if ("selfbot" in options && typeof options.selfbot !== "boolean") throw new TypeError("Selfbot must be true or false.");
  if ("readyMessage" in options && typeof options.readyMessage !== "function") throw new TypeError("ReadyMessage must be a function.");
  if ("commandMessageLifetime" in options && typeof options.commandMessageLifetime !== "number") throw new TypeError("CommandMessageLifetime must be a number.");
  if ("commandMessageSweep" in options && typeof options.commandMessageSweep !== "number") throw new TypeError("CommandMessageSweep must be a number.");
  if ("disableLogTimestamps" in options && typeof options.disableLogTimestamps !== "boolean") throw new TypeError("DisableLogTimestamps must be true or false.");
  if ("disableLogColor" in options && typeof options.disableLogColor !== "boolean") throw new TypeError("DisableLogColor must be true or false.");
  if ("cmdEditing" in options && typeof options.cmdEditing !== "boolean") throw new TypeError("CmdEditing must be true or false.");
  if ("cmdPrompt" in options && typeof options.cmdPrompt !== "boolean") throw new TypeError("CmdPrompt must be true or false.");
  if ("provider" in options) {
    if ("engine" in options.provider && typeof options.provider.engine !== "string") throw new TypeError("Engine must be a string.");
    if ("cache" in options.provider && typeof options.provider.cache !== "string") throw new TypeError("Cache must be a string.");
    Object.assign(options.provider, this.DEFAULT_OPTIONS.provider, Object.assign({}, options.provider));
  }
};
