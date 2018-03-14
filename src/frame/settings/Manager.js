class Manager {

  constructor(client) {

  }

}

module.exports = Manager;

/** Manager will act as the middleman between Settings && Providers
  * Ensures data is valid, schema is valid, things of that nature, and pass back to the providers to save
  * or to the settings to update
  * Either One Manager abstracted to work for all future Settings, or one manager per type of settings
  * ^ (not decided yet)
  */
