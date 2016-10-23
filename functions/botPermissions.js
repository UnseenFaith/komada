const permFlags = require("discord.js/src/util/Constants.js").PermissionFlags;

module.exports = client => {

  let genObject = {};

  for (let key in permFlags) {
    genObject[key] = false;
  }

  genObject.READ_MESSAGES = true;
  genObject.SEND_MESSAGES = true;

  client.commands.forEach(command => {
    if (command.conf.botPerms.length > 0) {
      command.conf.botPerms.forEach(val => {
        if (genObject.hasOwnProperty(val)) genObject[val] = true;
      });
    }
  });

  let permNumber = 0;
  for (let key in genObject) {
    if (genObject[key] === true) {
      permNumber += permFlags[key];
    }
  }
  return permNumber;
};
