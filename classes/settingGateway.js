const Resolver = require("./Resolver.js");
const CacheManager = require("./cacheManager.js");

/* eslint-disable no-restricted-syntax, guard-for-in */
module.exports = class SettingGateway extends CacheManager {
  constructor(client) {
    super(client);
    this.client = client;
    this.engine = client.config.provider.engine || "json";
    this.provider = this.client.providers.get(this.engine);
    this.resolver = new Resolver(client);
  }

  async init() {
    if (!this.provider) throw `This provider (${this.engine}) does not exist in your system.`;
    if (!this.schema || !this.schema.prefix) throw "There must be a valid schema with at least the prefix config.";
    await this.provider.init(this.client);
    const data = await this.provider.getAll("guilds");
    for (const key of data.values()) this.data.set(key.id, key);
    return true;
  }

  get schema() {
    return this.client.config.provider.schema || this.defaultDataSchema;
  }

  get defaults() {
    const output = [];
    for (const key in this.schema) output.push({ [key]: this.schema[key].default });
    return output;
  }

  async create(guild) {
    const target = await this.validateGuild(guild);
    await this.provider.create("guilds", target.id, this.defaults);
    return super.set(target.id, this.defaults);
  }

  async destroy(guild) {
    const target = await this.validateGuild(guild);
    await this.provider.delete("guilds", target.id);
    return super.delete("guilds", target.id);
  }

  async sync(guild = null) {
    if (!guild) {
      const data = await this.provider.getAll("guilds");
      for (const key of data.values()) super.set(key.id, key);
      return true;
    }
    const target = await this.validateGuild(guild);
    const data = await this.provider.get("guilds", target.id);
    return super.set(target.id, data);
  }

  async reset(guild, key) {
    const target = await this.validateGuild(guild);
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    return this.provider.update("guilds", target.id, key, this.schema.key.default);
  }

  async update(guild, key, data) {
    const target = await this.validateGuild(guild);
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    const result = await this.parse(target, this.schema.key, data);
    await this.provider.update("guilds", target.id, key, result);
    return this.sync(target.id);
  }

  async parse(guild, { type, min, max }, data) {
    switch (type) {
      case "User": {
        const result = await this.resolver.user(data);
        if (!result) throw "This key expects a User Object or ID.";
        return result.id;
      }
      case "Channel": {
        const result = await this.resolver.channel(data);
        if (!result) throw "This key expects a Channel Object or ID.";
        return result.id;
      }
      case "Guild": {
        const result = await this.resolver.guild(data);
        if (!result) throw "This key expects a Guild ID.";
        return result.id;
      }
      case "Role": {
        const result = await this.resolver.role(data, guild);
        if (!result) throw "This key expects a Role Object or ID.";
        return result.id;
      }
      case "Boolean": {
        const result = await this.resolver.boolean(data);
        if (!result) throw "This key expects a Boolean.";
        return result;
      }
      case "String": {
        const result = await this.resolver.string(data);
        SettingGateway.maxOrMin(result.length, min, max).catch((e) => { throw `The string length must be ${e} characters.`; });
        return result;
      }
      case "Integer": {
        const result = await this.resolver.integer(data);
        if (!result) throw "This key expects an Integer value.";
        SettingGateway.maxOrMin(result, min, max).catch((e) => { throw `The integer value must be ${e}.`; });
        return result;
      }
      case "Float": {
        const result = await this.resolver.float(data);
        if (!result) throw "This key expects a Float value.";
        SettingGateway.maxOrMin(result, min, max).catch((e) => { throw `The float value must be ${e}.`; });
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

  async validateGuild(guild) {
    const result = await this.resolver.guild(guild);
    if (!result) throw "The parameter <Guild> expects either a Guild or a Guild Object.";
    return result;
  }

  get defaultDataSchema() {
    return {
      prefix: {
        type: "String",
        data: this.client.config.prefix,
      },
      modRole: {
        type: "String",
        data: "Mods",
      },
      adminRole: {
        type: "String",
        data: "Devs",
      },
    };
  }
};
