let config = require("../../config.json").optnFunctions;

if (config === undefined) config = [];

exports.conf = {
  enabled: config.includes("points")
};

exports.init = (client) => {
  return new Promise( (resolve, reject) => {
    if(!client.databaseModules.first()) {
      reject("No Database Found");
    }
    client.databaseModules.first().hasTable("quiz")
    .then(res => {
      if(!res) {
        client.databaseModules.first().createTable("quiz");
      }
    });
  });
};

exports.run = function(client, msg, action) {
  return new Promise( (resolve, reject) => {
    let db = client.databaseModules.first();

    db.get("quiz", msg.author.id).then(points =>{
      switch(action) {
        case "add":
          points++;
          break;
        case "remove":
          if(points <= 0) break;
          points--;
          break;
        case "reset":
          points = 0;
          break;
        default:
          break;
      }
      db.set("quiz", msg.author.id, points).then(()=>{
        resolve(points);
      });
    }).catch(e =>{
      console.log(e);
      let points = action==="add" ? 1 : 0;
      db.set("quiz", msg.author.id, points).then(()=>resolve(points));
    });
  });
};
