/**
 * Express server adapter that hosts the REST API.
 * It configures middleware, mounts the router, and starts listening on the
 * configured port.
 */
import express from "express";
import cors from "cors";
import { buildRouter } from "./routes.js";
import { ApplicationServices } from "../../application/services.js";

export const startServer = (
  applicationServices: ApplicationServices,
  port = 3000
) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", buildRouter(applicationServices));

  return app.listen(port, () => console.log(`API on http://localhost:${port}`));
};
