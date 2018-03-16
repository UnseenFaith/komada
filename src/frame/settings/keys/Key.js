const { mergeDefaults } = require("discord.js");

class Key {

  constructor(schema, parent, options = {}) {
    if (this.constructor.name === "Key") throw new Error("You cannot construct the base Key class.");
    options = mergeDefaults(this.defaults, options);


    /**
      * @name schema
      * @type {Schema} The base Schema class that encapsulates this key.
      */
    Object.defineProperty(this, "schema", { value: schema });
    /**
      * @name parent
      * @type {Group} The parent Group for this key, if it exists.
      */
    Object.defineProperty(this, "parent", { value: parent });
    /**
      * @type {string} The name of the keys
      */
    this.name = options.name;

    /**
      * @type {?any} The default value for this key, if any.
      */
    this.default = options.default;

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
      parent: null,
      multiple: null,
      default: null,
      hidden: false,
      configurable: false,
      amount: Infinity,
      min: null,
      max: null,
    };
  }

  toJSON() {
    return {
      type: this.constructor.name,
      parent: this.parent.constructor.name,
      multiple: this.multiple,
      default: this.default,
      hidden: this.hidden,
      configurable: this.configurable,
      amount: this.amount,
      min: this.min,
      max: this.max,
    };
  }

  static async maxOrMin(value, min, max) {
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

}

module.exports = Key;
