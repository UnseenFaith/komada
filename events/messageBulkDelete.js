exports.run = (client, msgs) => {
  msgs.forEach(msg => client.emit("messageDelete", msg));
};
