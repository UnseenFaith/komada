module.exports = (bot, msg, cmd) => {
  return new Promise ((resolve, reject) => {
    let mps = [true];
    bot.commandInhibitors.forEach(mProc => {
      mps.push(mProc.run(bot, msg, cmd));
    });
    Promise.all(mps)
    .then(() => {
      resolve();
    })
    .catch(() => {
      reject();
    });
  });
};
