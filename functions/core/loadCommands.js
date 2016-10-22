const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname + "/../../cmds/");
//const dir = "./cmds/";
let [c, a] = [0,0];

module.exports = client => {
  client.commands.clear();
  client.aliases.clear();
  [c, a] = [0,0];
  fs.readdir(dir, (err, files) => {
    if (err) console.error(err);
    let folders = files.filter(f => { return f.split(".").length === 1; });
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    loadFiles(client, files, dir);
    let mps = [true];
    folders.forEach(folder => {
      mps.push(new Promise(res => {
        fs.readdir(`${dir}/${folder}/`, (err, subFiles) => {
          if (err) console.error(err);
          let subFolders = subFiles.filter(f => { return f.split(".").length === 1; });
          subFiles = subFiles.filter(f => { return f.slice(-3) === ".js"; });
          loadFiles(client, subFiles, `${dir}/${folder}/`);
          subFolders.forEach(subfolder => {
            fs.readdir(`${dir}/${folder}/${subfolder}/`, (err, subSubFiles) => {
              if (err) console.error(err);
              //category/subcategory is enough
              subSubFiles = subSubFiles.filter(f => { return f.slice(-3) === ".js"; });
              loadFiles(client, subSubFiles, `${dir}/${folder}/${subfolder}/`);
            });
          });
        });
        setTimeout(() => {res();}, 800);
      }));
    });
    Promise.all(mps).then(() => {client.funcs.log(`Loaded ${c} commands, with ${a} aliases.`);});
  });
};

const loadFiles = (client, files, directory) => {
  try {
    files.forEach(f => {
      let props = require(`${directory}${f}`);
      props.help["category"] = directory.slice(7, -1);
      client.commands.set(props.help.name, props);
      c++;
      if (props.conf.aliases === undefined) props.conf.aliases = [];
      props.conf.aliases.forEach(alias => {
        client.aliases.set(alias, props.help.name);
        a++;
      });
      delete require.cache[require.resolve(`${directory}${f}`)];
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
      console.error(e);
    }
  }
};
