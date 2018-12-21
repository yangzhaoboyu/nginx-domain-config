var fs = require('fs');
var linq = require('linq');
var settings = require("../settings");
var nginx = require("../utils/nginxHelper");
var config = require("../utils/configHelper");

module.exports = function (app) {

    /**
     * @swagger
     * tags:
     *   name: Domain
     *   description: 域名管理
     * 
     */

    /**
     * @swagger
     * /api/domains:
     *   get:
     *     tags: [Domain]
     *     summary: "查询已绑定的域名列表"
     *     description: 查询已绑定的域名列表
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: 域名列表
     *         schema: 
     *              type: object  
     *              properties: 
     *                success: 
     *                  type: boolean 
     *                  description: 操作是否成功.true：成功,false：失败 
     *                error: 
     *                  type: string 
     *                  description: 错误信息. 
     *                domains: 
     *                  type: array
     *                  items: 
     *                     type: string
     *                     description: 域名. 
     */
    app.get("/api/domains", function (req, res, next) {
        var result = config.readSync(settings.nginxConfigPath);
        if (result.status == 0) res.json({ success: false, error: '配置文件不存在' });
        else {
            res.json({ success: true, domains: result.data });
        }
    });

    /**
     * @swagger
     * /api/append/{domain}: 
     *   post:
     *     tags: [Domain]
     *     summary: "新增域名绑定"
     *     description: 新增域名绑定
     *     produces:
     *      - application/json
     *     parameters: 
     *     - name: "domain"
     *       in: "path"
     *       description: "需要绑定的域名"
     *       required: true
     *       type: "string"
     *     responses: 
     *       200:
     *          description: 请求成功
     *          schema: 
     *              type: object  
     *              properties: 
     *                success: 
     *                  type: boolean 
     *                  description: 操作是否成功.true：成功,false：失败 
     *                error: 
     *                  type: string 
     *                  description: 错误信息. 
     *                progress: 
     *                  type: string 
     *                  description: nginx -t 及 reload 的过程信息. 
     *     
     */
    app.post("/api/append/:domain", function (req, res, next) {
        var exists = fs.existsSync(settings.nginxConfigPath);
        if (!exists) res.status(400).json({ success: false, error: '配置文件不存在' });
        else {
            var data = fs.readFileSync(settings.nginxConfigPath);
            var original = data.toString().replace(new RegExp(" ", "g"), "").replace(new RegExp(";", "g"), "").replace(new RegExp("\r", "g"), "").split("\n");
            var lines = original.length;
            var domain = req.params.domain;
            var haveAppend = linq.from(original).where(function (val) { return val == domain; }).toArray().length <= 0;
            if (haveAppend) {
                original.splice(lines, 0, domain);
            }
            if (original.length != lines) {
                var context = original.join('\r\n ') + ';';
                fs.writeFileSync(settings.nginxConfigPath, context, 'utf8');
                var progress = [];
                //测试nginx配置
                nginx.verify(function (error, stdout, stderr) {
                    if (!error) {
                        //nginx 配置测试成功
                        progress.push("nginx -t successfully");
                        nginx.reload(function (error, stdout, stderr) {
                            if (!error) {
                                //nginx 重载成功
                                progress.push("nginx -s reload successfully");
                            }
                            res.json({ success: true, message: 'append successfully ...', progress: progress.join("\n") });
                        });
                    } else {
                        //nginx 配置测试失败
                        progress.push("nginx -t error" + error.message);
                        res.json({ success: true, message: 'append successfully ...', progress: progress.join("\n") });
                    }
                });
            } else {
                res.json({ success: false, message: 'domain name already exists ...' });
            }
        }
    });

    /* 删除配置 */
    app.post("/api/remove/:domain", function (req, res, next) {
        var exists = fs.existsSync(settings.nginxConfigPath);
        if (!exists) res.status(400).json({ success: false, error: 'file path does not exist' });
        else {
            var data = fs.readFileSync(settings.nginxConfigPath);
            var original = data.toString().replace(new RegExp(" ", "g"), "").replace(new RegExp(";", "g"), "").replace(new RegExp("\r", "g"), "").split("\n");
            var lines = original.length;
            var domain = req.params.domain;
            var haveRemove = linq.from(original).where(function (val) { return val == domain; }).toArray().length > 0;
            if (haveRemove) {
                var removeIndex = original.indexOf(domain);
                original.splice(removeIndex, 1);
            }
            if (original.length != lines) {
                var context = original.join('\r\n ') + ';';
                fs.writeFileSync(settings.nginxConfigPath, context, 'utf8');
                var progress = [];
                //测试nginx配置
                nginx.verify(function (error, stdout, stderr) {
                    if (!error) {
                        //nginx 配置测试成功
                        progress.push("nginx -t successfully");
                        nginx.reload(function (error, stdout, stderr) {
                            if (!error) {
                                //nginx 重载成功
                                progress.push("nginx -s reload successfully");
                            }
                            res.json({ success: true, message: 'append successfully ...', progress: progress.join("\n") });
                        });
                    } else {
                        //nginx 配置测试失败
                        progress.push("nginx -t error" + error.message);
                        res.json({ success: true, message: 'append successfully ...', progress: progress.join("\n") });
                    }
                });

            } else {
                res.json({ success: false, message: 'domain name not exist ...' });
            }
        }
    });
}