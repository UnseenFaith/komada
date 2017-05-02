class Base {
  constructor() {
    throw Error("You cannot construct this class. ")
  }

  fetch() {
    // return defualt configuration if no settings used
  }

  /* other defualt methods here */
}

module.exports = Base;
