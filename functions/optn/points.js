const points = new Map();

module.exports = function(bot, msg, action) {
  let userpoints = points.has(msg.author.id) ? points.get(msg.author.id) : {points:0};
  switch(action) {
    case "add": 
      points.set(msg.author.id, {points: userpoints.points++});
      break;
    case "remove":
      if(userpoints.points <= 0) break;
      points.set(msg.author.id, {points: userpoints.points--});
      break;
    case "reset":
      points.set(msg.author.id, {points:0});
      break;
    default:
      break;
  }
  points.set(msg.author.id, {points: userpoints.points});
  return userpoints.points;
};