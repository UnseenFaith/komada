module.exports = (client, msg) => {
  client.messageMonitors.forEach((mProc) => {
    if (mProc.conf.enabled) {
      mProc.run(client, msg);
    }
  });
};
