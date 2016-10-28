const fs = require("fs-extra");
const path = require("path");

module.exports = client => {
  client.commands.clear();
  client.aliases.clear();
  let counts = [0, 0];
  loadCommands(client, client.coreBaseDir, counts).then(counts => {
    loadCommands(client, client.clientBaseDir, counts).then(counts => {
      let [c, a] = counts;
      client.funcs.log(`Loaded ${c} commands, with ${a} aliases.`);
    });
  });
};

const loadCommands = (client, baseDir, counts) => {
  return new Promise( (resolve, reject) => {
    let dir = path.resolve(baseDir + "./commands/");

    let [c, a] = counts;
    try {
      fs.ensureDir(dir, err => {
        if(err) reject(err);
        fs.walk(dir)
        .on("data", (item) => {
          let fileinfo = path.parse(item.path),
            fileDir = fileinfo.dir,
            name = fileinfo.name,
            ext = fileinfo.ext;

          if(!ext || ext !== ".js") return;

          client.funcs.loadSingleCommand(client, name, false, `${fileDir}${path.sep}${fileinfo.base}`).then(cmd => {
            c++;
            cmd.conf.aliases.forEach(() => {
              a++;
            });
          })
          .catch(e=>{
            client.funcs.log(e, "Error");
          });
        })
        .on("end", () => {
          resolve([c, a]);
        });
      });
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        let module = /'[^']+'/g.exec(e.toString());
        client.funcs.installNPM(module[0].slice(1,-1))
        .then(() => {
          client.funcs.loadCommands(client);
        })
        .catch(e => {
          console.error(e);
          process.exit();
        });
      } else {
        reject(e);
      }
    }
  });
};
