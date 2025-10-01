/**
 * HTTP adapter exposing application services as Express routes.
 * It maps incoming API requests to use cases and translates results into
 * DTOs for clients.
 */
import { Router } from "express";
import { ApplicationServices } from "../../application/services.js";
import {
  toStoreDTO,
  toEmployeeDTO,
  toTimetableDTO,
  toShiftRangeDTO,
  toOrganizationOverviewDTO
} from "./mappers.js";

export const buildRouter = (applicationServices: ApplicationServices) => {
  const router = Router();

  router.get("/stores", async (_request, response) => {
    const stores = await applicationServices.listStores();
    response.json(stores.map(toStoreDTO));
  });

  router.get("/tree/stores", async (_request, response) => {
    const stores = await applicationServices.listStoresFromTree();
    response.json(stores);
  });

  router.get("/employees", async (_request, response) => {
    const employees = await applicationServices.listEmployees();
    response.json(employees.map(toEmployeeDTO));
  });

  router.get("/tree/employees", async (_request, response) => {
    const employees = await applicationServices.listEmployeesFromTree();
    response.json(employees);
  });

  router.get("/timetable/:storeName", async (request, response) => {
    try {
      const timetable = await applicationServices.getTimetableByStore(
        request.params.storeName
      );
      response.json(toTimetableDTO(timetable));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      response.status(404).json({ error: errorMessage });
    }
  });

  router.get("/tree/timetable/:storeName", async (request, response) => {
    try {
      const timetable = await applicationServices.getTimetableByStoreFromTree(
        request.params.storeName
      );
      response.json(toTimetableDTO(timetable));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      response.status(404).json({ error: errorMessage });
    }
  });

  router.get("/organization/overview", async (_request, response) => {
    const overview = await applicationServices.getOrganizationOverview();
    response.json(toOrganizationOverviewDTO(overview));
  });

  router.get("/shifts", async (_request, response) => {
    const shifts = await applicationServices.listShiftRanges();
    response.json(shifts.map(toShiftRangeDTO));
  });

  router.post("/shifts", async (request, response) => {
    const { employeeId, ranges, shiftId } = request.body || {};

    if (!employeeId || !Array.isArray(ranges)) {
      return response
        .status(400)
        .json({ error: "employeeId and ranges[] required" });
    }

    await applicationServices.upsertShifts({ employeeId, ranges, shiftId });
    response.status(204).end();
  });

  return router;
};
