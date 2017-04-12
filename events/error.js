exports.run = (client, e) => {
  client.emit('log', e, "error")
};