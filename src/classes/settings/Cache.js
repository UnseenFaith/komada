class Cache {

  constructor(settings, type) {
    /**
     * @name Cache.settings
     * @type {Settings} The settings instance that created this cache.
     * @readonly
     */
    /**
     * @name Cache.cache
     * @type {string} The provider/engine/cache that's being used to store data.
     * @readonly
     */
    Object.defineProperties(this, {
      settings: { value: settings },
      cache: { value: settings.client.config.provider.cache || "js" },
    });

    /**
     * @type {Collection|Provider} The data we are storing. This will be a collection or a provider if you change the cache.
     */
    this.data = this.cache === "js" ? new client.methods.Collection() : client.providers.get(this.cache);

    /**
     * @type {String} The type of data you're storing. Essentially this is just a name we use to distinguish different settings from each other.
     */
    this.type = type;
  }

  /**
   * Gets a single key from the data.
   * @param {any} key The key you're looking for.
   * @returns {?}
   */
  get(key) {
    return this.cache === "js" ? this.data.get(key) : this.data.get(this.type, key);
  }

  /**
   * Gets all entries in data.
   * @returns {Object[]}
   */
  getAll() {
    return this.cache === "js" ? Array.from(this.data.values()) : this.data.getAll(this.type);
  }

  /**
   * Checks if the data has a specific entry.
   * @param {any} key The key you want to check for.
   * @returns {boolean}
   */
  has(key) {
    return this.cache === "js" ? this.data.has(key) : this.data.has(this.type, key);
  }

  /**
   * Saves a key and it's new value to the cache.
   * @param {any} key The entry you want to set new data for.
   * @param {any} value The new data you want to set.
   * @returns {?}
   */
  set(key, value) {
    return this.cache === "js" ? this.data.set(key, value) : this.data.set(this.type, key, value);
  }

  /**
   * Deletes a key from the cache.
   * @param {any} key The key you want to delete
   * @returns {?}
   */
  delete(key) {
    return this.cache === "js" ? this.data.delete(key) : this.data.delete(this.type, key);
  }

  /**
   * @type {KomadaClient} The komada client.
   * @readonly
   */
  get client() {
    return this.settings.client;
  }

  /**
   * @type {string} The type of settings (or name).
   * @readonly
   */
  get type() {
    return this.settings.type;
  }

}

module.exports = Cache;
