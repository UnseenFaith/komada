const now = require('performance-now');
exports.run = (bot, msg, params = []) => {
  var startTime = now();
  msg.delete();
  msg.channel.sendMessage("Let's see if this works")
  .then( message => {
    var endTime = now();
    message.edit(`Ping took ${(endTime - startTime).toFixed(3)}ms. Test`).catch(console.error);
  }).catch(console.error);
};

exports.help = {
  name : "ping",
  description: "Ping/Pong. What do you *think* this does?",
  usage: "ping"
};