/**
 * EmployeeRepo implementation derived from an OrganizationStructureRepo.
 * IDs are derived deterministically as "employee-" + slugified(name)
 * to preserve compatibility with the in-memory fixtures.
 */
import { Employee } from "../../domain/entities/Employee.js";
import { EmployeeRepo } from "../../domain/ports/EmployeeRepo.js";
import { OrganizationStructureRepo } from "../../domain/ports/OrganizationStructureRepo.js";
import {
  OrganizationHeadquarterNode,
  OrganizationTreeNode,
  OrganizationStoreNode
} from "../../domain/types.js";

const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
const makeId = (name: string) => `employee-${slug(name)}`;
const cloneEmployee = (e: Employee) => new Employee(e.id, e.name, e.storeId);

const collectStores = (nodes: OrganizationTreeNode[]): OrganizationStoreNode[] =>
  nodes.flatMap(node =>
    node.type === "store" ? [node] : collectStores(node.children)
  );

export class MongoEmployeeRepo implements EmployeeRepo {
  constructor(private readonly orgRepo: OrganizationStructureRepo) {}

  private async compute(): Promise<Employee[]> {
    const hq: OrganizationHeadquarterNode = await this.orgRepo.getHeadquarter();
    const stores = collectStores(hq.children);

    const employees = stores.flatMap(store =>
      store.employees.map(
        name => new Employee(makeId(name), name, store.id)
      )
    );

    return employees;
  }

  async listAll(): Promise<Employee[]> {
    const all = await this.compute();
    return all.map(cloneEmployee);
  }

  async listByStore(storeId: string): Promise<Employee[]> {
    const all = await this.compute();
    return all.filter(e => e.storeId === storeId).map(cloneEmployee);
  }
}
