module.exports = (client, msg, min) => {
  for (let i = min; i < 11; i++) {
    if (client.permStructure.levels[i].check(client, msg)) return true;
    if (client.permStructure.levels[i].break) return false;
  }
  return null;
};
