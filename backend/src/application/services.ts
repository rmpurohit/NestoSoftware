/**
 * Application service factory that performs dependency injection.
 * It composes domain ports with use cases and exposes a cohesive API for
 * the web adapters to call.
 */
import { listStores } from "./listStores.js";
import { listEmployees } from "./listEmployees.js";
import { getOrganizationOverview, OrganizationOverview } from "./getOrganizationOverview.js";
import { getTimetableByStore, Timetable } from "./getTimetableByStore.js";
import { listStoresFromTree } from "./listStoresFromTree.js";
import { listEmployeesFromTree } from "./listEmployeesFromTree.js";
import { getTimetableByStoreFromTree } from "./getTimetableByStoreFromTree.js";
import { upsertShifts, UpsertShiftsCommand } from "./upsertShifts.js";
import { listShiftRanges, ShiftRangeSummary } from "./listShiftRanges.js";
import { StoreRepo } from "../domain/ports/StoreRepo.js";
import { EmployeeRepo } from "../domain/ports/EmployeeRepo.js";
import { ShiftRepo } from "../domain/ports/ShiftRepo.js";
import { OrganizationStructureRepo } from "../domain/ports/OrganizationStructureRepo.js";
import { Store } from "../domain/entities/Store.js";
import { Employee } from "../domain/entities/Employee.js";

export interface ApplicationDependencies {
  storeRepository: StoreRepo;
  employeeRepository: EmployeeRepo;
  shiftRepository: ShiftRepo;
  organizationStructureRepository: OrganizationStructureRepo;
}

export interface ApplicationServices {
  listStores(): Promise<Store[]>;
  listEmployees(): Promise<Employee[]>;
  getTimetableByStore(storeName: string): Promise<Timetable>;
  listStoresFromTree(): Promise<string[]>;
  listEmployeesFromTree(): Promise<string[]>;
  getTimetableByStoreFromTree(storeName: string): Promise<Timetable>;
  upsertShifts(command: UpsertShiftsCommand): Promise<void>;
  listShiftRanges(): Promise<ShiftRangeSummary[]>;
  getOrganizationOverview(): Promise<OrganizationOverview>;
}

export const buildApplicationServices = ({
  storeRepository,
  employeeRepository,
  shiftRepository,
  organizationStructureRepository
}: ApplicationDependencies): ApplicationServices => {
  const listStoresUseCase = listStores(storeRepository);
  const listEmployeesUseCase = listEmployees(employeeRepository);
  const getTimetableUseCase = getTimetableByStore(
    employeeRepository,
    shiftRepository,
    storeRepository
  );
  const listStoresFromTreeUseCase = listStoresFromTree(
    organizationStructureRepository
  );
  const listEmployeesFromTreeUseCase = listEmployeesFromTree(
    organizationStructureRepository
  );
  const getTimetableFromTreeUseCase = getTimetableByStoreFromTree(
    organizationStructureRepository,
    shiftRepository
  );
  const upsertShiftUseCase = upsertShifts(shiftRepository);
  const listShiftRangesUseCase = listShiftRanges(
    employeeRepository,
    shiftRepository
  );
  const getOrganizationOverviewUseCase = getOrganizationOverview(
    organizationStructureRepository,
    shiftRepository
  );

  return {
    listStores: listStoresUseCase,
    listEmployees: listEmployeesUseCase,
    getTimetableByStore: getTimetableUseCase,
    listStoresFromTree: listStoresFromTreeUseCase,
    listEmployeesFromTree: listEmployeesFromTreeUseCase,
    getTimetableByStoreFromTree: getTimetableFromTreeUseCase,
    upsertShifts: upsertShiftUseCase,
    listShiftRanges: listShiftRangesUseCase,
    getOrganizationOverview: getOrganizationOverviewUseCase
  };
};
