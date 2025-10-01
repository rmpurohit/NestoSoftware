/**
 * Infrastructure adapter that fulfils the EmployeeRepo port with static data.
 * It keeps employees in memory and returns clones so the domain stays pure.
 */
import { Employee } from "../../domain/entities/Employee.js";
import { EmployeeRepo } from "../../domain/ports/EmployeeRepo.js";

interface EmployeeRecord {
  id: string;
  name: string;
  storeId: string;
}

const employees: EmployeeRecord[] = [
  { id: "employee-claus", name: "Claus", storeId: "store-hamburg" },
  { id: "employee-claire", name: "Claire", storeId: "store-hamburg" },
  { id: "employee-daisy", name: "Daisy", storeId: "store-karlsruhe" },
  { id: "employee-daniel", name: "Daniel", storeId: "store-karlsruhe" },
  { id: "employee-emil", name: "Emil", storeId: "store-stuttgart" },
  { id: "employee-fred", name: "Fred", storeId: "store-muenchen" }
];

const cloneEmployee = (employee: Employee): Employee =>
  new Employee(employee.id, employee.name, employee.storeId);

export class InMemoryEmployeeRepo implements EmployeeRepo {
  private readonly employees: Employee[];

  constructor(initialEmployees: EmployeeRecord[] = employees) {
    this.employees = initialEmployees.map(
      employee => new Employee(employee.id, employee.name, employee.storeId)
    );
  }

  async listAll(): Promise<Employee[]> {
    return this.employees.map(cloneEmployee);
  }

  async listByStore(storeId: string): Promise<Employee[]> {
    return this.employees
      .filter(employee => employee.storeId === storeId)
      .map(cloneEmployee);
  }
}
