const fs = require("fs-extra");
const path = require("path");

const loadDataProviders = (client, baseDir, counts) => {
  return new Promise((resolve, reject) => {
    const dir = path.resolve(`${baseDir}./dataProviders/`);
    fs.ensureDir(dir, (err) => {
      if (err) console.error(err);
      fs.readdir(dir, (err, files) => {
        if (err) console.error(err);
        let [d, o] = counts;
        try {
          files = files.filter((f) => { return f.slice(-3) === ".js"; });
          files.forEach((f) => {
            const file = f.split(".");
            let props;
            if (file[1] !== "opt") {
              props = require(`${dir}/${f}`);
              client.dataProviders.set(file[0], props);
              props.init(client);
              d++;
            } else if (client.config.dataProviders.includes(file[0])) {
              props = require(`${dir}/${f}`);
              client.dataProviders.set(file[0], props);
              props.init(client);
              o++;
            }
          });
        } catch (e) {
          if (e.code === "MODULE_NOT_FOUND") {
            const module = /'[^']+'/g.exec(e.toString());
            client.funcs.installNPM(module[0].slice(1, -1))
              .then(() => {
                client.funcs.loadDataProviders(client, baseDir, counts);
              })
              .catch((e) => {
                console.error(e);
                process.exit();
              });
          } else {
            reject(e);
          }
        }
        resolve([d, o]);
      });
    });
  });
};

module.exports = (client) => {
  client.dataProviders.clear();
  const counts = [0, 0];
  loadDataProviders(client, client.coreBaseDir, counts).then((counts) => {
    loadDataProviders(client, client.clientBaseDir, counts).then((counts) => {
      const [d, o] = counts;
      client.funcs.log(`Loaded ${d} database handlers, with ${o} optional.`);
    });
  });
};
