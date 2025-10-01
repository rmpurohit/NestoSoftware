/**
 * Application use case that exposes employees through the employee port.
 * It simply forwards the call to the provided EmployeeRepo adapter.
 */
import { EmployeeRepo } from "../domain/ports/EmployeeRepo.js";

export const listEmployees = (employeeRepository: EmployeeRepo) => {
  return () => employeeRepository.listAll();
};
