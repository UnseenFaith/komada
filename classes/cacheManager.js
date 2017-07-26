module.exports = class CacheManager {

  constructor(client) {
    this.cacheEngine = client.config.provider.cache || "js";
    this.data = this.cacheEngine === "js" ? new client.methods.Collection() : client.providers.get(this.cacheEngine);
  }

  get(guild) {
    if (this.cacheEngine === "js") return this.data.get(guild);
    return this.data.get(this.type, guild);
  }

  getAll() {
    if (this.cacheEngine === "js") return this.data;
    return this.data.getAll(this.type);
  }

  set(guild, data) {
    if (this.cacheEngine === "js") return this.data.set(guild, data);
    return this.data.set(this.type, guild, data);
  }

  delete(guild) {
    if (this.cacheEngine === "js") return this.data.delete(guild);
    return this.data.delete(this.type, guild);
  }

};
