/**
 * Application use case that reads the organization tree port.
 * It traverses the injected OrganizationStructureRepo adapter to list
 * store names from the hierarchical domain model.
 */
import { OrganizationStructureRepo } from "../domain/ports/OrganizationStructureRepo.js";
import { OrganizationTreeNode } from "../domain/types.js";

const collectStores = (nodes: OrganizationTreeNode[]): string[] => {
  const result: string[] = [];
  const stack = [...nodes];

  while (stack.length > 0) {
    const node = stack.pop();

    if (!node) {
      continue;
    }

    if (node.type === "store") {
      result.push(node.name);
      continue;
    }

    stack.push(...node.children);
  }

  return result;
};

export const listStoresFromTree = (
  organizationStructureRepo: OrganizationStructureRepo
) =>
  async (): Promise<string[]> => {
    const headquarter = await organizationStructureRepo.getHeadquarter();
    return collectStores(headquarter.children).sort((a, b) =>
      a.localeCompare(b, "de")
    );
  };
