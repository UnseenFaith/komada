const fs = require("fs");

module.exports = client => {
  fs.readdir("./functions/optn", (err, files) => {
    client.functions.optn = {};
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let o = 0;
    files.forEach(f => {
      let name = f.split(".")[0];
      client.log(`Loading optional command: ${name}`);
      let props = require(`../optn/${f}`);
      client.log(props.conf.enabled);
      if (props.conf.enabled) {
        client.functions.optn[name] = props.run;
        o++;
      }
    });
    client.log(`Loaded ${o} optional functions`);
  });
};
