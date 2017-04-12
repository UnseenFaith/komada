exports.run = (client, e) => {
  client.emit('log', `Disconnected | ${e.code}: ${e.reason}`, "error")
};