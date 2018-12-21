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
        var output = { success: false, message: null, error: null };
        var result = config.readSync(settings.nginxConfigPath);
        if (result.status == 0) {
            output.error = "配置文件不存在";
            res.json(output);
        } else {
            var original = result.data;
            var lines = original.length;
            var domain = req.params.domain;
            var haveAppend = linq.from(original).where(function (val) { return val == domain; }).toArray().length <= 0;
            if (haveAppend) {
                original.splice(lines, 0, domain);
            }
            if (original.length != lines) {
                config.writeSync(settings.nginxConfigPath, original);
            }
            var verifyResult = nginx.verify();
            if (verifyResult.success) {
                var reloadResult = nginx.reload();
                if (reloadResult.success) {
                    output.success = true;
                    output.message = "域名绑定成功，nginx重载成功";
                    res.json(output);
                } else {
                    output.error = "nginx -s reload 执行失败";
                    res.json(output);
                }
            } else {
                output.error = "nginx -t 执行失败";
                res.json(output);
            }
        }
    });

    /**
     * @swagger
     * /api/remove/{domain}: 
     *   post:
     *     tags: [Domain]
     *     summary: "删除域名绑定"
     *     description: 删除域名绑定
     *     produces:
     *      - application/json
     *     parameters: 
     *     - name: "domain"
     *       in: "path"
     *       description: "需要删除绑定的域名"
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
    app.post("/api/remove/:domain", function (req, res, next) {
        var output = { success: false, message: null, error: null };
        var result = config.readSync(settings.nginxConfigPath);
        if (result.status == 0) {
            output.error = "配置文件不存在";
            res.json(output);
        } else {
            var original = result.data;
            var lines = original.length;
            var domain = req.params.domain;
            var haveRemove = linq.from(original).where(function (val) { return val == domain; }).toArray().length > 0;
            if (haveRemove) {
                var removeIndex = original.indexOf(domain);
                original.splice(removeIndex, 1);
            }
            if (original.length != lines) {
                config.writeSync(settings.nginxConfigPath, original);
            }
            var verifyResult = nginx.verify();
            if (verifyResult.success) {
                var reloadResult = nginx.reload();
                if (reloadResult.success) {
                    output.success = true;
                    output.message = "域名绑定成功，nginx重载成功";
                    res.json(output);
                } else {
                    output.error = "nginx -s reload 执行失败";
                    res.json(output);
                }
            } else {
                output.error = "nginx -t 执行失败";
                res.json(output);
            }
        }
    });
}