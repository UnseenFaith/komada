module.exports = function(client, msg, action) {
  return new Promise((resolve, reject) => {
    if (!client.config.init.includes("points")) {
      init(client)
        .then(() => {
          run(client, msg, action)
            .then(p => {
              resolve(p);
            });
        })
        .catch(e => {
          reject(e);
        });
    } else {
      run(client, msg, action)
        .then(p => {
          resolve(p);
        });
    }
  });
};

const run = (client, msg, action) => {
  return new Promise((resolve) => {
    let db = client.databaseModules.get("sqlite");

    db.get(client, "quiz", "userID", msg.author.id).then(row => {
      let points = row.points;
      switch (action) {
        case "add":
          points++;
          break;
        case "remove":
          if (points <= 0) break;
          points--;
          break;
        case "reset":
          points = 0;
          break;
        default:
          break;
      }
      db.update(client, "quiz", ["points"], [points], "userID", msg.author.id)
      .then(() => resolve(points));
    }).catch(e => {
      console.log(e);
      let points = action === "add" ? 1 : 0;
      db.update(client, "quiz", ["points"], [points], "userID", msg.author.id)
      .then(() => resolve(points));
    });
  });
};

const init = (client) => {
  return new Promise((resolve, reject) => {
    if (!client.databaseModules.first()) {
      reject("No Database Found");
    }
    client.databaseModules.get("sqlite").hasTable(client, "quiz")
      .then(res => {
        if (!res) {
          let keys = "<userID:str> <points:int>";
          client.databaseModules.get("sqlite").createTable(client, "quiz", keys);
        }
        client.config.init.push("points");
        resolve();
      });
  });
};
