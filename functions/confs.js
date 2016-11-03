const fs = require("fs-extra");
const path = require("path");
const guildConfs = new Map();
let dataDir = "";
let defaultFile = "default.json";
let defaultConf = {};

exports.init = (client) => {
  dataDir = path.resolve(`${client.clientBaseDir}${path.sep}bwd${path.sep}conf`);

  defaultConf = {
    prefix: {type: "String", data: client.config.prefix},
    disabledCommands: {type: "Array", data: []},
    mod_role: {type: "String", data: "Mods"},
    admin_role: {type: "String", data: "Devs"}
  };

  fs.ensureFileSync(dataDir + path.sep + defaultFile);
  try {
    let currentDefaultConf = fs.readJSONSync(path.resolve(dataDir + path.sep + defaultFile));
      Object.keys(defaultConf).forEach(key => {
        if (currentDefaultConf[key] === undefined) {
          currentDefaultConf[key] = defaultConf[key];
        } else {
          return;
        }
      });
      fs.outputJSONSync(dataDir + path.sep + defaultFile, currentDefaultConf);
      defaultConf = currentDefaultConf;
  } catch(e) {
    fs.outputJSONSync(dataDir + path.sep + defaultFile, defaultConf);
  }
  fs.walk(dataDir)
  .on("data", (item) => {
    let fileinfo = path.parse(item.path);
    if(!fileinfo.ext) return;
    if(fileinfo.name == "default") return;
    const guildID = fileinfo.name;
    const thisConf = fs.readJSONSync(path.resolve(dataDir + path.sep + fileinfo.base));
    guildConfs.set(guildID, thisConf);
  })
  .on("end", () => {
    client.emit("confsRead");
  });
};

exports.remove = (guild) => {
  if(!guildConfs.has(guild.id)) {
    return console.log(`Attempting to remove ${guild.name} but it's not there.`);
  }

  fs.unlinkSync(path.resolve(dataDir + path.sep + guild.id + ".json"));

  return true;
};

exports.has = (guild) => {
  return guildConfs.has(guild.id);
};

exports.get = (guild) => {
  let conf = {};
  if(!!guild && guildConfs.has(guild.id)) {
    let guildConf = guildConfs.get(guild.id);
    for(let key in guildConf) {
      if(guildConf[key]) conf[key] = guildConf[key].data;
      else conf[key] = defaultConf[key].data;
    }
  }
  for(let key in defaultConf) {
    if(!conf[key]) conf[key] = defaultConf[key].data;
  }
  return conf;
};

exports.addKey = (key, defaultValue) => {
  let type = defaultValue.constructor.name;
  if(["TextChannel", "GuildChannel", "Message", "User", "GuildMember", "Guild", "Role", "VoiceChannel", "Emoji", "Invite"].includes(type)) {
    defaultValue = defaultValue.id;
  }
  if(defaultValue.constructor.name !== type && defaultValue.constructor.name !== null) {
    return false;
  }
  defaultConf[key] = {type: defaultValue.constructor.name, data: defaultValue};
  fs.outputJSONSync(path.resolve(dataDir + path.sep + "default.json"), defaultConf);
};

exports.setKey = (key, defaultValue) => {
  if(!(key in defaultConf)) {
    throw new Error(`:x: The key \`${key}\` does not seem to be present in the default configuration.`);
  }
  if(defaultValue.constructor.name !== defaultConf[key].type) {
    throw new Error(`:x: The key \`${key}\` does not correspond to the type: ${defaultConf[key].type}.`);
  }
  defaultConf[key].data = defaultValue;
  fs.outputJSONSync(path.resolve(dataDir + path.sep + "default.json"), defaultConf);
};

exports.resetKey = (guild, key) => {
  if(!guildConfs.has(guild.id)) {
    throw new Error(`:x: The guild ${guild.id} not found while trying to reset ${key}`);
  }
  let thisConf = this.get(guild);
  if(!(key in thisConf)) {
    throw new Error(`:x: The key \`${key}\` does not seem to be present in the server configuration.`);
  }
  delete thisConf[key];
  guildConfs.set(guild.id, thisConf);
  fs.outputJSONSync(path.resolve(dataDir + path.sep + guild.id + ".json"), thisConf);
};

exports.delKey = (key, delFromAll) => {
  if(!(key in defaultConf)) {
    throw new Error(`:x: The key \`${key}\` does not seem to be present in the default configuration.`);
  }
  if(["serverID", "serverName", "prefix"].includes(key)) {
    throw new Error(`:x: The key \`${key}\` is core and cannot be deleted.`);
  }
  delete defaultConf[key];
  if(delFromAll) {
    guildConfs.forEach(conf => {
      delete conf[key];
      fs.outputJSONSync(path.resolve(dataDir + path.sep + conf.guildID + ".json"), conf);
    });
  }
};

exports.hasKey = (key) => {
  return (key in defaultConf);
};

exports.set = (guild, key, value) => {
  let thisConf = {};
  if(guildConfs.has(guild.id)) {
    thisConf = guildConfs.get(guild.id);
  }

  if(!(key in defaultConf)) {
    throw new Error(`:x: The key \`${key}\` is not valid according to the Default Configuration.`);
  }

  if(value.constructor.name !== defaultConf[key].type) {
    throw new Error(`:x: The key \`${key}\` does not correspond to the type: ${defaultConf[key].type}.`);
  }

  let type = value.constructor.name;
  if(["TextChannel", "GuildChannel", "Message", "User", "GuildMember", "Guild", "Role", "VoiceChannel", "Emoji", "Invite"].includes(type)) {
    value = value.id;
  }

  thisConf[key] = {data : value , type : defaultConf[key].type};

  guildConfs.set(guild.id, thisConf);
  fs.outputJSONSync(path.resolve(dataDir + path.sep + guild.id + ".json"), thisConf);

  return thisConf;
};
