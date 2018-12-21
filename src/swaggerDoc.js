const options = {
    swaggerDefinition: {
        info: {
            title: 'REST - Swagger',
            version: '1.0.0',
            description: 'REST API with Swagger doc'
        }
    },
    apis: ["./routes/api.js"],
    securityDefinitions: {
        auth: {
            "type": "basic"
        }
    },
    security: [
        {
            auth: []
        }
    ]
}
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = swaggerJSDoc(options);

const uiOptions = {
    customCss: '.scheme-container { display: none }'
}

module.exports = function (app) {

    app.get('api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(spec);
    });

    app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, uiOptions));
}
