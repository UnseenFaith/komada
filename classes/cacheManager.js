module.exports = class CacheManager {
  constructor(client, redis) {
    this.data = redis ? client.providers.get("redis") : new Map();
  }

  get(guild) {
    if (this.redis) return this.data.get("guilds", guild);
    return this.data.get(guild);
  }

  getAll() {
    if (this.redis) return this.data.getAll("guilds");
    return this.data;
  }

  set(guild, data) {
    if (this.redis) return this.data.get("guilds", guild, data);
    return this.data.set(guild, data);
  }

  delete(guild) {
    if (this.redis) return this.data.remove("guilds", guild);
    return this.data.delete(guild);
  }
};
