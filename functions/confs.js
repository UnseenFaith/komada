const fs = require("fs-extra");
const path = require("path");
const guildConfs = new Map();
let dataDir = "";
let defaultConf = {};

exports.init = (client) => {
  dataDir = path.resolve(`${client.clientBaseDir}${path.sep}bwd${path.sep}conf`);
  defaultConf = JSON.parse(fs.readFileSync(path.resolve(dataDir + path.sep + "default.json"), "utf8"));
  fs.ensureDirSync(dataDir);
  const configs = fs.readdirSync(dataDir);
  client.funcs.log(`Loading ${configs.length-1} configurations from memory`);
  for(const conf of configs) {
    if(conf !== "default.json");
    const guildID = conf.split(".")[0];
    const thisConf = JSON.parse(fs.readFileSync(path.resolve(dataDir + path.sep + conf), "utf8"));
    guildConfs.set(guildID, thisConf);
  }
  client.funcs.log(`Re-Checking Configuration for ${client.guilds.size}`);
  client.guilds.forEach(guild => {
    if(!guildConfs.has(guild.id)) {
      const conf = {};
      conf.guildName = guild.name;
      conf.guildID = guild.id;
      try {
        fs.writeFileSync(path.resolve(dataDir + path.sep + guild.id + ".json"), JSON.stringify(conf));
        guildConfs.set(guild.id, conf);
      } catch(e) {
        client.funcs.log("Error creating config file: "+e, "error");
      }
    }
  });
};

exports.add = (client, guild) => {
  if(guildConfs.has(guild.id)) throw new Error("Guild is already in the configurations");
  const conf = {};
  conf.guildName = guild.name;
  conf.guildID = guild.id;
  fs.writeFileSync(path.resolve(dataDir + path.sep + guild.id + ".json"), JSON.stringify(conf));
  guildConfs.set(guild.id, conf);
  return conf;
};

exports.remove = (client, guild) => {
  if(!guildConfs.has(guild.id)) throw new Error("Guild does not exist in configurations");
  fs.unlinkSync(path.resolve(dataDir + path.sep + guild.id + ".json"));

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
  fs.writeFileSync(path.resolve(dataDir + path.sep + "default.json"), JSON.stringify(defaultConf));
};

exports.setKey = (client, key, defaultValue) => {
  if(!(key in defaultConf)) {
    throw new Error(`:x: The key \`${key}\` does not seem to be present in the default configuration.`);
  }
  defaultConf[key] = defaultValue;
  fs.writeFileSync(path.resolve(dataDir + path.sep + "default.json"), JSON.stringify(defaultConf));
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
  fs.writeFile(path.resolve(dataDir + path.sep + guild.id + ".json"), JSON.stringify(thisConf));
  return thisConf;
};
