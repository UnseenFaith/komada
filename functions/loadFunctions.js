const fs = require("fs-extra");
const path = require("path");

module.exports = client =>
   new Promise((resolve, reject) => {
     const counts = [0, 0];
     loadFunctions(client, client.coreBaseDir, counts).then((counts) => {
       loadFunctions(client, client.clientBaseDir, counts).then((counts) => {
         const [d, o] = counts;
         client.funcs.log(`Loaded ${d} functions, with ${o} optional.`);
         resolve();
       });
     }).catch(reject);
   })
;

const loadFunctions = (client, baseDir, counts) =>
   new Promise((resolve, reject) => {
     const dir = path.resolve(`${baseDir}./functions/`);
     fs.ensureDirSync(dir);
     fs.readdir(dir, (err, files) => {
       if (err) reject(err);
       files = files.filter(f => f.slice(-3) === ".js");
       let [d, o] = counts;
       try {
         files.forEach((f) => {
           const file = f.split(".");
           if (file[0] === "loadFunctions") return;
           if (file[1] !== "opt") {
             client.funcs[file[0]] = require(`${dir}/${f}`);
             d++;
           } else if (client.config.functions.includes(file[0])) {
             client.funcs[file[0]] = require(`${dir}/${f}`);
             o++;
           }
         });
         resolve([d, o]);
       } catch (e) {
         if (e.code === "MODULE_NOT_FOUND") {
           const module = /'[^']+'/g.exec(e.toString());
           client.funcs.installNPM(module[0].slice(1, -1))
            .then(() => {
              client.funcs.loadDatabaseHandlers(client);
            })
            .catch((e) => {
              console.error(e);
              process.exit();
            });
         } else {
           reject(e);
         }
       }
     });
   })
;
