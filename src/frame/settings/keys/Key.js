const { mergeDefaults } = require("discord.js");

class Key {

  constructor(options = {}) {
    if (this.constructor.name === "Key") throw new Error("You cannot construct the base Key class.");
    options = mergeDefaults(this.defaults, options);
    /**
      * @type {string} The name of the keys
      */
    this.name = options.name;

    /**
      * @type {string} The type of Key being added
      * ^ Might be changed to be the KeyExtendedClass
      */
    this.type = options.type;

    /**
      * @type {?String} Null, Array, Set, or Map
      * ^ Will probably take a string, but store as the Global Object
      */
    this.multiple = options.multiple;

    /**
      * @type {boolean} Whether or not this key should be non-enumerable
      */
    this.hidden = options.hidden;

    /**
      * @type {boolean} Whether or not this key can be changed by an outside source. (Schema.edit)
      */
    this.configurable = options.configurable;

    /**
      * @type {number} A number which will determine how many items can be stored in this key.
      * This will only work if multiple is set to one of Array/Map(Collection?)/Set
      */
    this.amount = options.amount;

    /**
      * @type {number} A number that determines the minimum length of strings or value of numbers.
      */
    this.min = options.min;

    /**
      * @type {number} A number that determines the maximum length of strings or value of numbers.
      */
    this.max = options.max;
  }

  /** NOTE:
    * Keys will create their own resolvers to be used.
    * All custom keys will have to inherit this base class for which will have a storage called "Keys" that can take Key instances and add them in.
    * require("komada").(Settings // not final).Keys.add(KeyExtendedClass) => KeyStorage.add => Schema.add({ name: nameOfKey, type: KeyExtendedClass });
    * more stuff I can't think of currently... baby steps.
    */

  get defaults() {
    return {
      type: this.constructor.name,
      multiple: null,
      hidden: false,
      configurable: false,
      amount: Infinity,
      min: null,
      max: null,
    };
  }

}

module.exports = Key;
