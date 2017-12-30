class Storage {

  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }

}

module.exports = Storage;
