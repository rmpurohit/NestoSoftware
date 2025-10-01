/**
 * Domain port defining the persistence boundary for shifts.
 * It tells adapters how the core expects to store and retrieve shift
 * aggregates by employee.
 */
import { Shift } from "../entities/Shift.js";
export interface ShiftRepo {
  upsert(shift: Shift): Promise<void>;
  getByEmployee(employeeId: string): Promise<Shift | null>;
  getByEmployeeName(employeeName: string): Promise<Shift | null>;
}
