    class Cache {
    constructor(client, type) {
        /**
         * @name Cache#client
         * @type {KomadaClient} The komada client that created this cache instance.
         * @readonly
         */
        /**
         * @name Cache#engine
         * @type {string} The engine that's being used for storing data.
         * @readonly
         */
        Object.defineProperties(this, {
            "client": { value: client },
            "engine": { value: client.config.provider.cache || "js" }
        });

        /**
         * @type {Collection|Provider} The data we are storing. This will be a collection or a provider if you change the engine.
         */
        this.data = this.engine === "js" ? new client.methods.Collection() : client.providers.get(this.engine);

        /**
         * @type {String} The type of data you're storing. Essentially this is just a name we use to distinguish different settings from each other.
         */
        this.type = type;

    }

    /**
     * Gets a single key from the data.
     * @param {any} key
     */
    get(key) {
        return this.engine === "js" ? this.data.get(key) : this.data.get(this.type, key);
    }

    /**
     * Gets all entries in data.
     */
    getAll() {
        return this.engine === "js" ? Array.from(this.data.values()) : this.data.getAll(this.type);
    }

    /**
     * Saves a key and it's new value to the cache.
     * @param {any} key
     * @param {any} value
     */
    set(key, value) {
        return this.engine === "js" ? this.data.set(key, value) : this.data.set(this.type, key, value);
    }

    /**
     * Deletes a key from the cache.
     * @param {any} key
     */
    delete(key) {
        return this.engine === "js" ? this.data.delete(key) : this.data.delete(this.type, key);
    }
}

module.exports = Cache;
