/**
 * Application use case that aggregates read models from two ports.
 * It joins employee data with shift records to expose flattened range
 * summaries for reporting.
 */
import { EmployeeRepo } from "../domain/ports/EmployeeRepo.js";
import { ShiftRepo } from "../domain/ports/ShiftRepo.js";

export interface ShiftRangeSummary {
  employee: string;
  start: string;
  end: string;
}

export const listShiftRanges = (
  employeeRepo: EmployeeRepo,
  shiftRepo: ShiftRepo
) =>
  async (): Promise<ShiftRangeSummary[]> => {
    const employees = await employeeRepo.listAll();

    const shiftRanges = await Promise.all(
      employees.map(async employee => {
        const shift = await shiftRepo.getByEmployee(employee.id);

        if (!shift) {
          return [] as ShiftRangeSummary[];
        }

        return shift.ranges.map(range => ({
          employee: employee.name,
          start: range.start,
          end: range.end
        }));
      })
    );

    return shiftRanges.flat();
  };
