module.exports = (client, msg, min) => {
	for (let i = min; i < 12; i++) {
		if (i === 11) return null;
		if (client.permStructure[i].check(client, msg)) return true;
		if (client.permStructure[i].break) break;
	}
	return false;
};
