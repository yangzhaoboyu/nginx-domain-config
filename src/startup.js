//路由初始化
module.exports.initRoutes = function (app) {
    require("./routes/config")(app);
    require("./routes/api")(app);
};