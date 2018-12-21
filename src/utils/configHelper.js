var fs = require('fs');
var linq = require('linq');
var configHelper = {

    /**
     * @description 读取配置文件
     * @param {String} path 配置文件路径
     * @returns {Object} 
     */
    readSync: function (path) {
        var exists = fs.existsSync(path);
        if (!exists) {
            //文件不存在
            return { status: 0 };
        } else {
            var data = fs.readFileSync(path);
            var original = data.toString().replace(new RegExp(" ", "g"), "").replace(new RegExp(";", "g"), "").replace(new RegExp("\r", "g"), "").split("\n");
            var views = linq.from(original).where(function (val) { return val.search("server_name") == -1 }).toArray();
            return { data: views };
        }
    },
    /**
     * @description 写入配置文件
     */
    writeSync: function (path, data) {
        var existsHead = linq.from(data).where(function (val) { return val.search("server_name") != -1 }).toArray().length > 0;
        if (!existsHead) {
            data.splice(data.length, 0, "server_name");
        }
        var context = data.join('\r\n ') + ';';
        fs.writeFileSync(path, context, 'utf8');
    }
}
module.exports = configHelper;