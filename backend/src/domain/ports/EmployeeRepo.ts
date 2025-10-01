/**
 * Domain port describing how the core needs to read employee data.
 * Adapters provide implementations that fetch employee aggregates for use
 * cases.
 */
import { Employee } from "../entities/Employee.js";
export interface EmployeeRepo {
  listAll(): Promise<Employee[]>;
  listByStore(storeId: string): Promise<Employee[]>;
}
