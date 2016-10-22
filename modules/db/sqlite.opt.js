const db = require("sqlite");
const fs = require("fs-extra");

const config = {
  moduleName: "sqlite",
  enabled: true,
  baseLocation: "./bwd/db/sqlite"
};
exports.conf = config;

const dataSchema = {
  str: {
    create: "TEXT",
    insert: value => value,
    select: value => value
  },
  int: {
    create: "INTEGER",
    insert: value => parseInt(value),
    select: value => value
  },
  autoid: {
    create: "INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE",
    insert: () => {throw "Cannot insert Auto ID value!";},
    select: value => value
  },
  timestamp: {
    create: "DATETIME",
    insert: value => parseInt(value),
    select: value => value
  },
  autots: {
    create: "DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL",
    insert: () => {throw "Cannot insert Auto Timestamp value!";},
    select: value => value
  },
  bool: {
    create: "INTEGER",
    insert: value => !value ? 0: -1,
    select: value => !!value
  },
  json: {
    create: "TEXT",
    insert: value => JSON.stringify(value),
    select: value => JSON.parse(value)
  }
};

const schemaCache = new Map();

exports.init = client => {
  client.funcs.log("Initializing sqlite dataProvider...");
  return new Promise( (resolve, reject) => {
    fs.ensureDir(config.baseLocation, (e) => {
      if (e) console.error(e);
      db.open(`${config.baseLocation}/db.sqlite`).then(()=> {
        db.run("CREATE TABLE IF NOT EXISTS dataProviderSchemas (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, name, schema)")
        .then(() => {
          db.all("SELECT * FROM dataProviderSchemas")
          .then(rows => {
            console.log(rows);
            rows.map(r=> schemaCache.set(r.name, r.schema));
          });
          resolve();
        })
        .catch(reject);
      });
    });
  });
};

exports.get = (client, table, key, value) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${table} WHERE ${key} = '${value}'`)
    .then(resolve)
    .catch(reject);
  });
};

exports.getAll = (client, table) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${table}`)
    .then(resolve)
    .catch(reject);
  });
};

exports.insert = (client, table, keys, values) => {
  return new Promise( (resolve, reject) => {
    if(!schemaCache.has(table)) reject("Table not found in schema cache");
    let schema = schemaCache.get(table);
    client.funcs.validateData(schema, keys, values); // automatically throws error
    let insertValues = schema.map((field, index)=>dataSchema[field.type].insert(values[index]));
    let questionMarks = schema.map(()=>"?").join(", ");
    client.funcs.log("Inserting Values: " + insertValues.join(";"));
    db.run(`INSERT INTO ${table}(${keys.join(", ")}) VALUES(${questionMarks});`, insertValues)
    .then(resolve(true))
    .catch(e=>reject("Error inserting data: "+e));
  });
};

exports.has = (client, table, key, value) => {
  return new Promise( resolve => {
    db.get(`SELECT id FROM ${table} WHERE ${key} = '${value}'`)
    .then(()=> resolve(true))
    .catch(()=>resolve(false));
  });
};

exports.update = (client, table, keys, values, whereKey, whereValue) => {
  return new Promise( (resolve, reject) => {
    if(!schemaCache.has(table)) reject("Table not found in schema cache");
    let schema = schemaCache.get(table);
    let filtered = schema.filter(f=> keys.includes(f.name));
    client.funcs.validateData(schema, keys, values);
    let inserts = filtered.map((field, index)=>`${field.name} = ${dataSchema[field.type].insert(values[index])}`);
    db.run(`UPDATE ${table} SET ${inserts} WHERE ${whereKey} = '${whereValue}';`)
    .then(resolve(true))
    .catch(e=>reject("Error inserting data: "+e));
  });
};

exports.insertSchema = (client, tableName, schema) => {
  db.run("INSERT INTO dataProviderSchemas (name, schema) VALUES (?, ?)", [tableName, schema]);
  schemaCache.set(tableName, schema);
};

exports.delete = (client, table, key) => {
  return db.run(`DELETE FROM ${table} WHERE id = '${key}'`);
};

exports.hasTable = (client, table) => {
  return new Promise( (resolve, reject) => {
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`)
    .then(()=> resolve(true))
    .catch(e => reject(e));
  });
};

exports.createTable = (client, tableName, keys) => {
  return new Promise( (resolve, reject) => {
    let tags = client.funcs.parseTags(keys);
    let schema = client.funcs.createDBSchema(tags);
    let inserts = schema.map(field=>`${field.name} ${dataSchema[field.type].create}`).join(", ");
    db.run(`CREATE TABLE '${tableName}' (${inserts});`)
     .then(() => {
       this.insertSchema(client, tableName, JSON.stringify(schema));
       resolve(true);
     }).catch(reject);
  });
};

exports.deleteTable = (client, tableName) => {
  return db.run(`DROP TABLE '${tableName}'`);
};

exports.run = sql => {
  return db.run(sql);
};
