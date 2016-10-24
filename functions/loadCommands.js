const fse = require("fs-extra");
const path = require("path");

module.exports = client => {
  client.commands.clear();
  client.aliases.clear();

  loadCommands(client, client.coreBaseDir);
  loadCommands(client, client.clientBaseDir);
};

const loadCommands = (client, baseDir) => {
  return new Promise( (resolve, reject) => {
    let dir = path.resolve(baseDir + "./commands/");

    let [c, a] = [0,0];
    try {
      fse.walk(dir)
      .on("data", (item) => {
        let fileinfo = path.parse(item.path),
          fileDir = fileinfo.dir,
          name = fileinfo.name,
          ext = fileinfo.ext;

        if(!ext) return;

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
        client.funcs.log(`Loaded ${c} commands, with ${a} aliases.`);
        resolve(`Loaded ${c} commands, with ${a} aliases.`);
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
