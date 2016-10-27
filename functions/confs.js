const fs = require("fs-extra");
const path = require("path");
const guildConfs = new Map();
let dataDir = "";
let defaultFile = "default.json";
let defaultConf = {};

exports.init = (client) => {
  dataDir = path.resolve(`${client.clientBaseDir}${path.sep}bwd${path.sep}conf`);

  // Load default configuration, create if not exist.
  defaultConf = {prefix:client.config.prefix, disabledCommands: []};
  fs.ensureFileSync(dataDir + path.sep + defaultFile);
  try {
    defaultConf = fs.readJSONSync(path.resolve(dataDir + path.sep + defaultFile));
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
    client.guilds.forEach(guild => {
      if(!guildConfs.has(guild.id)) {
        const conf = {};
        conf.guildName = guild.name;
        conf.guildID = guild.id;
        try {
          fs.outputJSONSync(path.resolve(dataDir + path.sep + guild.id + ".json"), conf);
          guildConfs.set(guild.id, conf);
        } catch(e) {
          client.funcs.log("Error creating config file: "+e, "error");
        }
      }
    });
    client.emit("confsRead");
  });
};

exports.add = (client, guild) => {
  if(guildConfs.has(guild.id)) {
    return console.log(`Attempting to add ${guild.name} but it's already there.`);
  }
  const conf = {};
  conf.guildName = guild.name;
  conf.guildID = guild.id;
  fs.outputJSONSync(path.resolve(dataDir + path.sep + guild.id + ".json"), conf);
  guildConfs.set(guild.id, conf);
  return conf;
};

exports.remove = (client, guild) => {
  if(!guildConfs.has(guild.id)) {
    return console.log(`Attempting to remove ${guild.name} but it's not there.`);
  }
  try {
    fs.unlinkSync(path.resolve(dataDir + path.sep + guild.id + ".json"));
  } catch (e) {
    client.funcs.log(e, "error");
  }
  return true;
};

exports.has = (guild) => {
  return guildConfs.has(guild.id);
};

exports.get = (guild) => {
  if(guildConfs.has(guild.id)) {
    let guildConf = guildConfs.get(guild.id);
    const conf = {};
    for(let key in guildConf) {
      if(guildConf[key]) conf[key] = guildConf[key];
      else conf[key] = defaultConf[key];
    }
    for(let key in defaultConf) {
      if(!conf[key]) conf[key] = defaultConf[key];
    }
    return conf;
  }
  else return defaultConf;
};

exports.addKey = (client, key, defaultValue) => {
  defaultConf[key] = defaultValue;
  fs.outputJSONSync(path.resolve(dataDir + path.sep + "default.json"), defaultConf);
};

exports.setKey = (client, key, defaultValue) => {
  if(!(key in defaultConf)) {
    throw new Error(`:x: The key \`${key}\` does not seem to be present in the default configuration.`);
  }
  defaultConf[key] = defaultValue;
  fs.outputJSONSync(path.resolve(dataDir + path.sep + "default.json"), defaultConf);
};

exports.resetKey = (client, guild, key) => {
  if(!guildConfs.has(guild.id)) {
    throw new Error(`:x: The guild ${guild.id} not found while trying to reset ${key}`);
  }
  let thisConf = this.get(guild);
  if(!(key in thisConf)) {
    throw new Error(`:x: The key \`${key}\` does not seem to be present in the server configuration.`);
  }
  delete thisConf[key];
  fs.outputJSONSync(path.resolve(dataDir + path.sep + guild.id + ".json"), thisConf);
};

exports.delKey = (client, key, delFromAll) => {
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

exports.hasKey = (client, key) => {
  return (key in defaultConf);
};

exports.set = (client, guild, key, value) => {
  if(!guildConfs.has(guild.id)) {
    throw new Error(`:x: The guild ${guild.id} not found while trying to set ${key} to ${value}`);
  }

  let thisConf = this.get(guild);
  if(!(key in thisConf)) {
    throw new Error(`:x: The key \`${key}\` was not found in the configuration for ${guild.name}.`);
  }

  if(["serverID", "serverName"].includes(key)) throw new Error(`:x: The key \`${key}\` is read-only.`);

  thisConf[key] = value;
  guildConfs.set(guild.id, thisConf);
  fs.outputJSONSync(path.resolve(dataDir + path.sep + guild.id + ".json"), thisConf);
  return thisConf;
};
