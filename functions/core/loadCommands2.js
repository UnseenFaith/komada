const fse = require("fs-extra");
const path = require("path");

module.exports = client => {
  client.commands.clear();
  client.aliases.clear();
  let [c, a] = [0,0];
  let modules = [];
  try {
    fse.walk("./cmds/")
    .on("data", (item) => {
      let fileinfo = path.parse(item.path);
      if(!fileinfo.ext) return;
      let relative = path.relative(__dirname, fileinfo.dir);
      relative = path.normalize(relative);
      let props = require(`${relative}/${fileinfo.name}${fileinfo.ext}`);
      props.moduleName = relative.split("\\").slice(3)[0];
      if(!props.moduleName) props.moduleName = "base";
      if(!~modules.indexOf(props.moduleName))
        modules.push(props.moduleName);
      client.commands.set(props.help.name, props);
      //client.log(`Loaded ${props.moduleName}/${props.help.name}.`);
      c++;
      if (props.conf.aliases === undefined) props.conf.aliases = [];
      props.conf.aliases.forEach( alias => {
        client.aliases.set(alias, props.help.name);
        a++;
      });
    })
    .on("end", () => {
      client.log(`Loaded ${c} commands, with ${a} aliases.`);
      client.log(`Modules: ${modules.join(",")}`);
      /*
        files.forEach(f => {
          delete require.cache[require.resolve(`../../cmds/${f}`)];
        });
      */
    });
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      let module = /'[^']+'/g.exec(e.toString());
      client.funcs.installNPM(module[0].slice(1,-1))
      .then(() => {
        client.funcs.loadCommands2(client);
      })
      .catch(e => {
        console.error(e);
        process.exit();
      });
    } else {
      console.error(e);
    }
  }
};
