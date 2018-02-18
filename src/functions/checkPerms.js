module.exports = (client, msg, min) => {
  for (let i = min; i <= client.permStructure.size; i++) {
    if (client.permStructure.levels[i].check(client, msg)) return true;
    if (client.permStructure.levels[i].break) return false;
  }
  return null;
};
