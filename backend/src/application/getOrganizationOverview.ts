/**
 * Application use case that composes multiple domain services.
 * It reads the organization structure port, enriches it with shift data,
 * and returns a comprehensive overview for adapters.
 */
import { OrganizationStructureRepo } from "../domain/ports/OrganizationStructureRepo.js";
import { ShiftRepo } from "../domain/ports/ShiftRepo.js";
import {
  OrganizationHeadquarterNode,
  OrganizationStoreNode,
  OrganizationTreeNode
} from "../domain/types.js";
import { getTimetableByStoreFromTree } from "./getTimetableByStoreFromTree.js";
import { Timetable } from "./getTimetableByStore.js";

export interface OrganizationOverview {
  headquarter: OrganizationHeadquarterNode;
  stores: string[];
  employees: string[];
  timetables: Timetable[];
}

const collectStoreNodes = (
  nodes: OrganizationTreeNode[]
): OrganizationStoreNode[] =>
  nodes.flatMap(node => {
    if (node.type === "store") {
      return [node];
    }

    return collectStoreNodes(node.children);
  });

  export const getOrganizationOverview = (
    organizationStructureRepo: OrganizationStructureRepo,
    shiftRepo: ShiftRepo
  ) =>
    async (): Promise<OrganizationOverview> => {
      const headquarter: OrganizationHeadquarterNode =
        await organizationStructureRepo.getHeadquarter();
  
      const storeNodes: OrganizationStoreNode[] =
        collectStoreNodes(headquarter.children);
  
      const storeNames: string[] = storeNodes.map(store => store.name);
  
      const timetableUseCase = getTimetableByStoreFromTree(
        organizationStructureRepo,
        shiftRepo
      );
  
      const timetables: Timetable[] = await Promise.all(
        storeNames.map(storeName => timetableUseCase(storeName))
      );
  
      const employees: string[] = Array.from(
        new Set(storeNodes.flatMap(store => store.employees))
      ).sort((a, b) => a.localeCompare(b, "de"));
  
      return {
        headquarter,
        stores: storeNames,
        employees,
        timetables
      };
    };
  