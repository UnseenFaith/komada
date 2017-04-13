exports.conf = {
	enabled: true,
	spamProtection: true,
	priority: 5
};

exports.run = (client, msg, cmd, args = undefined) => new Promise((resolve, reject) => {
	const usage = cmd.usage.parsedUsage;
	const prefix = msg.guildConf.prefix.length;
	const prefixLength = client.config.prefixMention.test(msg.content) ? client.config.prefixMention.exec(msg.content)[0].length + 1 : prefix.length;
	if (!args) {
		args = msg.content.slice(prefixLength).trim().split(' ').slice(1).join(' ').split(cmd.help.usageDelim !== '' ? cmd.help.usageDelim : undefined);
	}
	if (args[0] === '') args = [];
	let currentUsage;
	let repeat = false;
	if (usage.length === 0) return resolve();

	const validateArgs = async (i) => {
		if (i >= usage.length && i >= args.length) {
			resolve(args);
			return;
		} else if (usage[i]) {
			if (usage[i].type !== 'repeat') {
				currentUsage = usage[i];
			} else if (usage[i].type === 'repeat') {
				currentUsage.type = 'optional';
				repeat = true;
			}
		} else if (!repeat) {
			resolve(args);
			return;
		}
		if (currentUsage.type === 'optional' && (args[i] === undefined || args[i] === '') && currentUsage.possibles[0].type !== 'rsn' && currentUsage.possibles[0].type !== 'osrsn') {
			if (usage.slice(i).some(usa => usa.type === 'required')) {
				reject(client.funcs.newError('Missing one or more required arguments after end of input.', 1, args));
				return;
			} else {
				resolve(args);
				return;
			}
		} else if (currentUsage.type === 'required' && args[i] === undefined && currentUsage.possibles[0].type !== 'rsn' && currentUsage.possibles[0].type !== 'osrsn') {
			reject(currentUsage.possibles.length === 1 ?
				`${currentUsage.possibles[0].name} is a required argument.` :
				`Missing a required option: (${currentUsage.possibles.map(poss => poss.name).join(', ')})`);
			return;
		} else if (currentUsage.possibles.length === 1) {
			if (client.argResolver[currentUsage.possibles[0].type]) {
				client.argResolver[currentUsage.possibles[0].type](args[i], currentUsage, 0, repeat).then(res => {
					if (res !== null) {
						args[i] = res;
						validateArgs(++i);
					} else {
						args.splice(i, 0, undefined);
						validateArgs(++i);
					}
				})
				.catch(err => reject(client.funcs.newError(err, 1, args)));
			} else {
				console.warn('Unknown Argument Type encountered');
				validateArgs(++i);
			}
		} else {
			multiPossibles(0, i, false);
		}
	};

	const multiPossibles = (possible, i, validated) => {
		if (validated) {
			validateArgs(++i);
			return;
		} else if (possible >= currentUsage.possibles.length) {
			if (currentUsage.type === 'optional' && !repeat) {
				args.splice(i, 0, undefined);
				validateArgs(++i);
				return;
			} else {
				reject(client.funcs.newError(`Your option didn't match any of the possibilities: (${currentUsage.possibles.map(poss => poss.name).join(', ')})`, 1, args));
			}
		} else if (client.argResolver[currentUsage.possibles[possible].type]) {
			client.argResolver[currentUsage.possibles[possible].type](args[i], currentUsage, possible, repeat)
			.then(res => {
				if (res !== null) {
					args[i] = res;
					multiPossibles(++possible, i, true);
				} else {
					multiPossibles(++possible, i, validated);
				}
			}).catch(() => multiPossibles(++possible, i, validated));
		} else {
			console.warn('Unknown Argument Type encountered');
			multiPossibles(++possible, i, validated);
		}
	};

	return validateArgs(0);
});
