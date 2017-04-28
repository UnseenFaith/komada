const Config = require('../Config.js');

const truthy = [true, 'true', 1, 't', 'yes', 'y'];
const falsy = [false, 'false', 0, 'f', 'no', 'n'];

class Boolean {
	constructor(conf, data) {
		Object.defineProperty(this, '_guild', { value: conf._guild });
		Object.defineProperty(this, '_dataDir', { value: conf._dataDir });
		Object.defineProperty(this, '_client', { value: conf._client });
		this.type = 'Boolean';
		if (typeof data !== 'boolean') this._data = false;
		else this._data = data;
	}

	get data() {
		return this._data;
	}

	set data(data) {
		if (truthy.includes(data)) data = true;
		else if (falsy.includes(data)) data = false;
		else throw 'Data provided was not a truthy or falsy variable.';
		this._data = data;
		Config.save(this._dataDir, this._guild.id);
	}
}

module.exports = Boolean;
