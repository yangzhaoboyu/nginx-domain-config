var fs = require('fs');
var linq = require('linq');
var settings = require("../settings");
module.exports = function (app) {

  /*配置*/
  app.get("/config", function (req, res, next) {
    var exists = fs.existsSync(settings.nginxConfigPath);
    if (exists) {
      var data = fs.readFileSync(settings.nginxConfigPath);
      console.log(data.toString());
      var original = data.toString().replace(new RegExp(" ", "g"), "").replace(new RegExp(";", "g"), "").replace(new RegExp("\r", "g"), "").split("\n");
      //处理显示
      var views = linq.from(original).where(function (val) { return val.search("server_name") == -1 }).toArray();
      console.log(views);
      res.render("config", { views: views });
    }
  });
};
