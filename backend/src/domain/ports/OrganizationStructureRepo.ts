/**
 * Domain port exposing the hierarchical organization structure.
 * Adapters supply the headquarter node so use cases can navigate the tree
 * without infrastructure knowledge.
 */
import { OrganizationHeadquarterNode } from "../types.js";

export interface OrganizationStructureRepo {
  getHeadquarter(): Promise<OrganizationHeadquarterNode>;
}
