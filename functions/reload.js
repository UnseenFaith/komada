const path = require("path");

exports.function = (client, msg, dir, funcName) => new Promise((resolve, reject) => {
  if (client.funcs.hasOwnProperty(funcName)) {
    client.funcs[funcName] = "";
    client.funcs.getFileListing(client, dir, "functions").then((files) => {
      const oldFunction = files.filter(f => f.name === funcName);
      try {
        oldFunction.forEach((file) => {
          delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
          client.funcs[funcName] = require(`${file.path}${path.sep}${file.base}`);
          if (client.funcs[funcName].init) {
            client.funcs[funcName].init(client);
          }
        });
      } catch (error) {
        reject(`:x: ${error}`);
        return;
      }
      resolve();
    });
  } else {
    reject(`:x: The function **${funcName}** does not seem to exist!`);
  }
});

exports.inhibitor = (client, msg, dir, inhibName) => new Promise((resolve, reject) => {
  if (client.commandInhibitors.has(inhibName)) {
    client.commandInhibitors.delete(inhibName);
    client.funcs.getFileListing(client, dir, "inhibitors").then((files) => {
      const oldInhibitor = files.filter(f => f.name === inhibName);
      try {
        oldInhibitor.forEach((file) => {
          delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
          const props = require(`${file.path}${path.sep}${file.base}`);
          client.commandInhibitors.set(file.name, props);
          if (props.init) {
            props.init(client);
          }
        });
      } catch (error) {
        reject(`:x: ${error}`);
        return;
      }
      resolve();
    });
  } else {
    reject(`:x: The inhibitor **${inhibName} does not seem to exist!`);
  }
});

exports.monitor = (client, msg, dir, monitName) => new Promise((resolve, reject) => {
  if (client.commandMonitors.has(monitName)) {
    client.commandMonitors.delete(monitName);
    client.funcs.getFileListing(client, dir, "monitors").then((files) => {
      const oldMonitor = files.filter(f => f.name === monitName);
      try {
        oldMonitor.forEach((file) => {
          delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
          const props = require(`${file.path}${path.sep}${file.base}`);
          client.commandMonitors.set(file.name, props);
          if (props.init) {
            props.init(client);
          }
        });
      } catch (error) {
        reject(`:x: ${error}`);
        return;
      }
      resolve();
    });
  } else {
    reject(`:x: The monitor **${monitName} does not seem to exist!`);
  }
});

exports.provider = (client, msg, dir, providerName) => new Promise((resolve, reject) => {
  if (client.dataProviders.has(providerName)) {
    client.dataProviders.delete(providerName);
    client.funcs.getFileListing(client, dir, "dataProviders").then((files) => {
      const oldProvider = files.filter(f => f.name === providerName);
      try {
        oldProvider.forEach((file) => {
          delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
          const props = require(`${file.path}${path.sep}${file.base}`);
          client.dataProviders.set(file.name, props);
          if (props.init) {
            props.init(client);
          }
        });
      } catch (error) {
        reject(`:x: ${error}`);
        return;
      }
      resolve();
    });
  } else {
    reject(`:x: The provider **${providerName} does not seem to exist!`);
  }
});

exports.event = (client, msg, eventName) => new Promise((resolve, reject) => {
  client.funcs.getFileListing(client, client.clientBaseDir, "events").then((files) => {
    const oldEvent = files.filter(f => f.name === eventName);
    if (oldEvent[0] && oldEvent[0].name === eventName) {
      let listener;
      if (client._events[eventName].length !== 0) {
        listener = client._events[eventName].filter((ev) => { return ev === require.resolve(`${oldEvent[0].path}${path.sep}${oldEvent[0].base}`); });
        console.log(listener);
      } else {
        listener = client._events[eventName];
      }
      client.removeListener(eventName, listener);
      try {
        oldEvent.forEach((file) => {
          delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
          client.on(file.name, (...args) => require(`${file.path}${path.sep}${file.base}`).run(client, ...args));
        });
      } catch (error) {
        reject(`:x: ${error}`);
        return;
      }
      resolve();
    } else {
      reject(`:x: The event **${eventName}** does not seem to exist!`);
    }
  });
});

exports.command = (client, msg, commandName) => new Promise((resolve, reject) => {
  let command;
  if (client.commands.has(commandName)) {
    command = commandName;
  } else if (client.aliases.has(commandName)) {
    command = client.aliases.get(commandName);
  }
  if (!command) {
    client.funcs.getFileListing(client, client.coreBaseDir, "commands")
      .then((files) => {
        const newCommands = files.filter(f => f.name === command);
        newCommands.forEach((file) => {
          client.funcs.loadSingleCommand(client, command, false, `${file.path}${path.sep}${file.base}`)
                .catch((e) => {
                  reject(`:x: ${e}`);
                });
        });
      });
    resolve();
  } else {
    client.funcs.loadSingleCommand(client, command, true)
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(`:x: ${e}`);
          });
  }
});
