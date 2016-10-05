exports.run = (bot, msg, params = []) => {
  var code = params.join(" ");
  try {
    var evaled = eval(code);
    if (typeof evaled !== 'string')
      evaled = require('util').inspect(evaled);
    msg.channel.sendMessage("```xl\n" + clean(evaled) + "\n```");        
  }
  catch(err) {
    msg.channel.sendMessage("`ERROR` ```xl\n" +
    clean(err) +
    "\n```");
  }
};

exports.help = {
  name : "eval",
  description: "Evaluates arbitrary Javascript. Not for the faint of heart.\nExpression may contain multiple lines.",
  usage: "eval <expression>",
  restrict: (id) => {return id==="139412744439988224"}
};

function clean(text) {
  if (typeof(text) === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  }
  else {
      return text;
  }
}