const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const swaggerUi = require("swagger-ui-express");

const swaggerPath = path.resolve(__dirname, "docs", "swagger.yaml");
const swaggerFile = fs.readFileSync(swaggerPath, "utf8");
const swaggerDocument = yaml.parse(swaggerFile);

// delete Health tag & path
delete swaggerDocument.paths["/health"];
swaggerDocument.tags = swaggerDocument.tags.filter((t) => t.name !== "Health");

const swaggerDocs = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1, // -1 代表完全隱藏 Schemas 區塊
        defaultModelExpandDepth: 0, //  預設不自動展開
      },
    })
  );
};

module.exports = { swaggerDocs };
