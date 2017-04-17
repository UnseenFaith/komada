const Array = require('./Array.js');
const Boolean = require('./Boolean.js');
const Channel = require('./Channel.js');
const Number = require('./Number.js');
const Role = require('./Role.js');
const String = require('./String.js');

module.exports = {
	Array: Array,
	Boolean: Boolean,
	Channel: Channel,
	Number: Number,
	Role: Role,
	String: String
};

// Could define a loader here to add custom user-defined types in the future
