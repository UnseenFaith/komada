const LocalStorage = require("node-localstorage").LocalStorage;
const tables = [];

const config = {
  moduleName: "localStorage",
  enabled: true,
  baseLocation: "./bwd/db/localStorage"
};
exports.conf = config;

exports.init = () => {
  return new Promise( (resolve, reject) => {
    let test;
    try {
      test = new LocalStorage(`${config.baseLocation}/system-test`);
      resolve(test);
    }
    catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

exports.get = (table, key) => {
  return new Promise( (resolve, reject) => {
    try {
      let value = tables[table].getItem(key);
      resolve(value);
    } catch(e) {
      console.log(e);
      reject(e);
    }
  });
};

exports.set = (table, key, value) => {
  return new Promise( (resolve, reject) => {
    try {
      resolve(tables[table].setItem(key, value));
    } catch(e) {
      console.log(e);
      reject(e);
    }
  });
};

exports.delete = (table, key) => {
  return new Promise( (resolve, reject) => {
    try {
      resolve(tables[table].removeItem(key));
    } catch(e) {
      console.log(e);
      reject(e);
    }
  });
};

exports.createTable = (tableName) => {
  return new Promise( (resolve, reject) => {
    try {
      resolve(tables[tableName] = new LocalStorage(`${config.baseLocation}/${tableName}`));
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
