const exec = require("child_process").exec;

module.exports = (module) => {
  return new Promise((resolve, reject) => {
    exec(`npm i ${module}`, (e, stdout, stderr) => {
      console.log("=====INSTALLED NEW DEPENDANCY=====");
      console.log(stdout);
      console.error(stderr);      
      resolve();
    });
  });
};
