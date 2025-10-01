/**
 * Application use case that mixes tree and shift ports.
 * It locates a store inside the organization tree and uses the shift port
 * to build a timetable view from names instead of identifiers.
 */
import { OrganizationStructureRepo } from "../domain/ports/OrganizationStructureRepo.js";
import { ShiftRepo } from "../domain/ports/ShiftRepo.js";
import { OrganizationTreeNode } from "../domain/types.js";
import { Timetable, TimetableEntry } from "./getTimetableByStore.js";

const findStoreNode = (
  nodes: OrganizationTreeNode[],
  storeName: string
): OrganizationTreeNode | undefined => {
  const stack = [...nodes];
  const targetName = storeName.toLowerCase();

  while (stack.length > 0) {
    const node = stack.pop();

    if (!node) {
      continue;
    }

    if (node.type === "store" && node.name.toLowerCase() === targetName) {
      return node;
    }

    if (node.type !== "store") {
      stack.push(...node.children);
    }
  }

  return undefined;
};

const buildTimetableEntries = async (
  shiftRepo: ShiftRepo,
  employeeNames: string[]
): Promise<TimetableEntry[]> => {
  const entries = await Promise.all(
    employeeNames.map(async employeeName => {
      const shift = await shiftRepo.getByEmployeeName(employeeName);
      return {
        name: employeeName,
        ranges: shift?.ranges ?? []
      };
    })
  );

  return entries;
};

export const getTimetableByStoreFromTree = (
  organizationStructureRepo: OrganizationStructureRepo,
  shiftRepo: ShiftRepo
) =>
  async (storeName: string): Promise<Timetable> => {
    const headquarter = await organizationStructureRepo.getHeadquarter();
    const storeNode = findStoreNode(headquarter.children, storeName);

    if (!storeNode || storeNode.type !== "store") {
      throw new Error(`Store ${storeName} not found`);
    }

    const entries = await buildTimetableEntries(
      shiftRepo,
      storeNode.employees
    );

    return { storeName: storeNode.name, entries };
  };
