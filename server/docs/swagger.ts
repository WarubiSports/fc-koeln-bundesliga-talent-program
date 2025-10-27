import path from "node:path";
import yaml from "yamljs";
import swaggerUi from "swagger-ui-express";
import type express from "express";

/** Mounts Swagger UI at /docs using server/docs/openapi.yaml */
export function setupSwagger(app: express.Express) {
  const docPath = path.resolve("./server/docs/openapi.yaml");
  const swaggerDocument = yaml.load(docPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("📘 Swagger docs available at /docs");
}
