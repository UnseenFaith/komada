const Resolver = require("./Resolver.js");
const CacheManager = require("./cacheManager.js");

/* eslint-disable no-restricted-syntax, guard-for-in */
module.exports = class ConfigGateway extends CacheManager {
  constructor(client) {
    super();
    this.client = client;
    this.engine = client.config.provider.engine || "json";
    this.redis = client.config.provider.redis || false;
    this.provider = this.client.providers.get(this.engine);
    this.resolver = new Resolver(client);
  }

  async init() {
    const data = await this.provider.getAll("guilds");
    for (const key of data.values()) this.data.set(key.id, key);
    return true;
  }

  get schema() {
    return this.client.config.provider.schema || {
      prefix: {
        default: this.client.config.prefix,
        type: "string",
      },
    };
  }

  get defaults() {
    const output = [];
    for (const key in this.schema) output.push({ [key]: this.schema[key].default });
    return output;
  }

  async create(guild) {
    await this.provider.create("guilds", guild, this.defaults);
    return super.set(guild, this.defaults);
  }

  async destroy(guild) {
    await this.provider.delete("guilds", guild);
    return super.delete("guilds", guild);
  }

  async sync(guild = null) {
    if (!guild) {
      const data = await this.provider.getAll("guilds");
      for (const key of data.values()) super.set(key.id, key);
      return true;
    }
    const data = await this.provider.get("guilds", guild);
    return super.set(guild, data);
  }

  async reset(guild, key) {
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    return this.provider.update("guilds", guild, key, this.schema.key.default);
  }

  async update(guild, key, data) {
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    const result = await this.parse(guild, this.schema.key, data);
    await this.provider.update("guilds", guild, key, result);
    return this.sync(guild);
  }

  async parse(guild, { type, min, max }, data) {
    switch (type) {
      case "user": {
        const result = await this.resolver.user(data);
        if (!result) throw "This key expects a User Object or ID.";
        return result.id;
      }
      case "channel": {
        const result = await this.resolver.channel(data);
        if (!result) throw "This key expects a Channel Object or ID.";
        return result.id;
      }
      case "guild": {
        const result = await this.resolver.guild(data);
        if (!result) throw "This key expects a Guild ID.";
        return result.id;
      }
      case "role": {
        const result = await this.resolver.role(data, guild);
        if (!result) throw "This key expects a Role Object or ID.";
        return result.id;
      }
      case "boolean": {
        const result = await this.resolver.boolean(data);
        if (!result) throw "This key expects a Boolean.";
        return result;
      }
      case "string": {
        const result = await this.resolver.string(data);
        ConfigGateway.maxOrMin(result.length, min, max).catch((e) => { throw `The string length must be ${e} characters.`; });
        return result;
      }
      case "integer": {
        const result = await this.resolver.integer(data);
        if (!result) throw "This key expects an Integer value.";
        ConfigGateway.maxOrMin(result, min, max).catch((e) => { throw `The integer value must be ${e}.`; });
        return result;
      }
      case "float": {
        const result = await this.resolver.float(data);
        if (!result) throw "This key expects a Float value.";
        ConfigGateway.maxOrMin(result, min, max).catch((e) => { throw `The float value must be ${e}.`; });
        return result;
      }
      case "url": {
        const result = await this.resolver.url(data);
        if (!result) throw "This key expects an URL (Uniform Resource Locator).";
        return result;
      }
      // no default
    }
    return null;
  }

  static maxOrMin(value, min, max) {
    if (min && max) {
      if (value >= min && value <= max) return true;
      if (min === max) throw `exactly ${min}`;
      throw `between ${min} and ${max}`;
    } else if (min) {
      if (value >= min) return true;
      throw `longer than ${min}`;
    } else if (max) {
      if (value <= max) return true;
      throw `shorter than ${max}`;
    }
    return null;
  }
};
