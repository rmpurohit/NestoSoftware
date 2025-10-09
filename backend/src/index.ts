/**
 * Application composition root responsible for dependency injection.
 * It now supports switching between in-memory and MongoDB persistence
 * via environment variables (see .env).
 */
import "dotenv/config";
import type { Server } from "http";
import { startServer } from "./infrastructure/web/server.js";
import { buildApplicationServices } from "./application/services.js";

// In-memory adapters
import { InMemoryStoreRepo } from "./infrastructure/repositories/InMemoryStoreRepo.js";
import { InMemoryEmployeeRepo } from "./infrastructure/repositories/InMemoryEmployeeRepo.js";
import { InMemoryShiftRepo } from "./infrastructure/repositories/InMemoryShiftRepo.js";
import { InMemoryOrganizationStructureRepo } from "./infrastructure/repositories/InMemoryOrganizationStructureRepo.js";

// Mongo adapters
import { connectMongo, closeMongo } from "./infrastructure/db/mongo.js";
import { MongoOrganizationStructureRepo } from "./infrastructure/repositories/MongoOrganizationStructureRepo.js";
import { MongoShiftRepo } from "./infrastructure/repositories/MongoShiftRepo.js";
import { MongoStoreRepo } from "./infrastructure/repositories/MongoStoreRepo.js";
import { MongoEmployeeRepo } from "./infrastructure/repositories/MongoEmployeeRepo.js";

const registerGracefulShutdown = (server: Server, extra: { close?: () => Promise<void> } = {}) => {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    if (extra.close) {
      try { await extra.close(); } catch {}
    }
    server.close(() => process.exit(0));
  };
  signals.forEach(s => process.on(s, () => void shutdown(s)));
};

(async () => {
  try {
    const mode = (process.env.PERSISTENCE || "memory").toLowerCase();

    let applicationServices: ReturnType<typeof buildApplicationServices>;
    let cleanup: (() => Promise<void>) | undefined;

    if (mode === "mongo") {
      const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
      const dbName = process.env.MONGODB_DB || "bestfood";
      const db = await connectMongo({ uri, dbName });

      const organizationStructureRepository = new MongoOrganizationStructureRepo(db);
      const storeRepository = new MongoStoreRepo(organizationStructureRepository);
      const employeeRepository = new MongoEmployeeRepo(organizationStructureRepository);
      const shiftRepository = new MongoShiftRepo(db);

      applicationServices = buildApplicationServices({
        storeRepository,
        employeeRepository,
        shiftRepository,
        organizationStructureRepository
      });

      cleanup = async () => { await closeMongo(); };
      console.log("Persistence: MongoDB");
    } else {
      applicationServices = buildApplicationServices({
        storeRepository: new InMemoryStoreRepo(),
        employeeRepository: new InMemoryEmployeeRepo(),
        shiftRepository: new InMemoryShiftRepo(),
        organizationStructureRepository: new InMemoryOrganizationStructureRepo()
      });
      console.log("Persistence: In-memory");
    }

    const serverPort = Number(process.env.PORT) || 3000;
    const server = startServer(applicationServices, serverPort);

    registerGracefulShutdown(server, { close: cleanup });
  } catch (error) {
    console.error("Failed to start application", error);
    process.exit(1);
  }
})();
