const Config = require('../Config.js');

class String {
	constructor(conf, data) {
		Object.defineProperty(this, '_guild', { value: conf._guild });
		Object.defineProperty(this, '_dataDir', { value: conf._dataDir });
		Object.defineProperty(this, '_client', { value: conf._client });
		this.type = 'String';
		if (typeof data !== 'string') this._data = '';
		else this._data = data;
		if (data.possibles) this.possibles = data.possibles;
		else this.possibles = [];
	}

	get data() {
		return this._data;
	}

	set data(data) {
		if (typeof data !== 'string') throw 'Data must be a string';
		if (this.possibles.length !== 0 && !this.possibles.includes(data)) throw `That is not a valid option. Valid options: ${this.possibles.join(', ')}`;
		else this._data = data;
		Config.save(this._dataDir, this._guild.id);
		return this;
	}

	add(value) {
		if (!value === undefined || (!(value instanceof Array) && typeof value !== 'string')) throw 'Please supply a valid value (array, or string) to add to the possibles array.';
		if (value instanceof Array) {
			value.forEach((val) => {
				if (!this.possibles.includes(val)) this.possibles.push(val);
			});
		} else {
			if (this.possibles.includes(value)) throw 'That value already exists in the possibles array.';
			this.possibles.push(value);
		}
		Config.save(this._dataDir, this._guild.id);
		return this;
	}

	del(value) {
		if (!value === undefined || (!(value instanceof Array) && typeof value !== 'string')) throw 'Please supply a valid value (array, or string) to add to the possibles array.';
		if (value instanceof Array) {
			value.forEach((val) => {
				if (this.possibles.includes(val)) this.possibles.splice(this.possibles.indexOf(val), 1);
			});
		} else {
			if (!this.possibles.includes(value)) throw 'That value does not already exist in the possibles array.';
			this.possibles.splice(this.possibles.indexOf(value), 1);
		}
		Config.save(this._dataDir, this._guild.id);
		return this;
	}
}

module.exports = String;
