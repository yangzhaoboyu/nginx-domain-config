var process = require('child_process');
var nginxHelper = {
    /** 配置文件校验 */
    verify: function (callback) {
        process.exec('nginx -t', function (error, stdout, stderr) {
            callback(error, stdout, stderr);
        });
    },
    /** 配置文件重载 */
    reload: function (callback) {
        process.exec('nginx -s reload', function (error, stdout, stderr) {
            callback(error, stdout, stderr);
        });
    }
}
module.exports = nginxHelper;