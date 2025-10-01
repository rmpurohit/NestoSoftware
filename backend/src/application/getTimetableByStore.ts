/**
 * Application use case that builds a timetable from domain data.
 * It orchestrates calls to employee, shift, and store ports to produce a
 * view model for a single store.
 */
import { EmployeeRepo } from "../domain/ports/EmployeeRepo.js";
import { ShiftRepo } from "../domain/ports/ShiftRepo.js";
import { StoreRepo } from "../domain/ports/StoreRepo.js";

export interface TimetableEntry {
  name: string;
  ranges: { start: string; end: string }[];
}

export interface Timetable {
  storeName: string;
  entries: TimetableEntry[];
}

const buildTimetableEntries = async (
  employeeRepository: EmployeeRepo,
  shiftRepository: ShiftRepo,
  storeId: string
): Promise<TimetableEntry[]> => {
  const employeesInStore = await employeeRepository.listByStore(storeId);

  const buildTimetableEntryForEmployee = async (
    employeeId: string,
    employeeName: string
  ) => {
    const shift = await shiftRepository.getByEmployee(employeeId);
    return {
      name: employeeName,
      ranges: shift?.ranges ?? []
    };
  };

  return Promise.all(
    employeesInStore.map(employee =>
      buildTimetableEntryForEmployee(employee.id, employee.name)
    )
  );
};

export const getTimetableByStore = (
  employeeRepository: EmployeeRepo,
  shiftRepository: ShiftRepo,
  storeRepository: StoreRepo
) =>
  async (storeName: string): Promise<Timetable> => {
    const store = await storeRepository.getByName(storeName);

    if (!store) {
      throw new Error("Store not found");
    }

    const entries = await buildTimetableEntries(
      employeeRepository,
      shiftRepository,
      store.id
    );

    return { storeName: store.name, entries };
  };
