class Base {

  async update({ data, guild, id } = {}) {
    id = id || this.id;
    if (!id) throw new Error("You must provide an ID"); // placeholder stuff
  }

  async sync() {

  }

}

module.exports = Base;


/** Base Class will expose Methods to be used by both the "Settings" class (available from client.something)
  * and the class that will inherently have all of the resolved settings (if there is one available)
  * For example: Guild Configs
  * client.settings.guilds.update(someParams)
  * <GuildObject>.update(someParams)
  * Both of these will be the same function that work interchangeable with the manager/settings instance.
  */
