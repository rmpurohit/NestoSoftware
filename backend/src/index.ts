/**
 * Application composition root responsible for dependency injection.
 * It wires domain ports to in-memory infrastructure adapters, builds the
 * application service layer, and boots the HTTP server adapter.
 */
import "dotenv/config";
import type { Server } from "http";
import { startServer } from "./infrastructure/web/server.js";
import { InMemoryStoreRepo } from "./infrastructure/repositories/InMemoryStoreRepo.js";
import { InMemoryEmployeeRepo } from "./infrastructure/repositories/InMemoryEmployeeRepo.js";
import { InMemoryShiftRepo } from "./infrastructure/repositories/InMemoryShiftRepo.js";
import { InMemoryOrganizationStructureRepo } from "./infrastructure/repositories/InMemoryOrganizationStructureRepo.js";
import { buildApplicationServices } from "./application/services.js";

const registerGracefulShutdown = (server: Server) => {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  let shuttingDown = false;

  const closeServer = () =>
    new Promise<void>((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`Received ${signal}. Shutting down gracefully...`);

    try {
      await closeServer();
      console.log("Shutdown complete. Bye!");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown", error);
      process.exit(1);
    }
  };

  signals.forEach(signal => {
    process.on(signal, () => {
      void shutdown(signal);
    });
  });
};

(async () => {
  try {
    const applicationServices = buildApplicationServices({
      storeRepository: new InMemoryStoreRepo(),
      employeeRepository: new InMemoryEmployeeRepo(),
      shiftRepository: new InMemoryShiftRepo(),
      organizationStructureRepository: new InMemoryOrganizationStructureRepo()
    });

    const serverPort = Number(process.env.PORT) || 3000;
    const server = startServer(applicationServices, serverPort);

    registerGracefulShutdown(server);
  } catch (error) {
    console.error("Failed to start application", error);
    process.exit(1);
  }
})();
