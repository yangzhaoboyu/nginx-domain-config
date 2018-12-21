var execSync = require('child_process').execSync;
var nginxHelper = {
    /** 配置文件校验 */
    verify: function () {
        try {
            var out = execSync("nginx -t");
            return { success: true, message: out.toString() }
        } catch (error) {
            return { success: false }
        }
    },
    /** 配置文件重载 */
    reload: function () {
        try {
            var out = execSync("nginx -s reload");
            return { success: true, message: out.toString() }
        } catch (error) {
            return { success: false }
        }
    }
}
module.exports = nginxHelper;