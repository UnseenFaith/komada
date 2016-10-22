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
      let relative = path.normalize(path.relative(__dirname, fileinfo.dir));
      let props = require(`${relative}/${fileinfo.name}${fileinfo.ext}`);
      props.moduleName = relative.split("\\").slice(3).join("/");
      //if(!props.moduleName) props.moduleName = "base";
      if(!~modules.indexOf(props.moduleName))
        modules.push(props.moduleName);
      client.commands.set(props.help.name, props);
      c++;
      if (props.conf.aliases === undefined) props.conf.aliases = [];
      props.conf.aliases.forEach( alias => {
        client.aliases.set(alias, props.help.name);
        a++;
      });
      delete require.cache[require.resolve(`${relative}/${fileinfo.name}${fileinfo.ext}`)];
    })
    .on("end", () => {
      client.funcs.log(`Loaded ${c} commands, with ${a} aliases.`);
      client.funcs.log(`Modules: ${modules.join(",")}`);
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
