/**
 * Application use case that navigates the organizational tree port.
 * It collects employee names from the OrganizationStructureRepo adapter
 * without touching persistence details.
 */
import { OrganizationStructureRepo } from "../domain/ports/OrganizationStructureRepo.js";
import { OrganizationTreeNode } from "../domain/types.js";

const collectEmployees = (nodes: OrganizationTreeNode[]): string[] => {
  const result: string[] = [];
  const stack = [...nodes];

  while (stack.length > 0) {
    const node = stack.pop();

    if (!node) {
      continue;
    }

    if (node.type === "store") {
      result.push(...node.employees);
      continue;
    }

    stack.push(...node.children);
  }

  return result;
};

export const listEmployeesFromTree = (
  organizationStructureRepo: OrganizationStructureRepo
) =>
  async (): Promise<string[]> => {
    const headquarter = await organizationStructureRepo.getHeadquarter();
    return collectEmployees(headquarter.children).sort((a, b) =>
      a.localeCompare(b, "de")
    );
  };
