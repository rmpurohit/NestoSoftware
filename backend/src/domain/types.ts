/**
 * Domain shared types describing core business concepts.
 * These definitions capture organization tree shapes and primitive aliases
 * used across ports and entities.
 */
export type NodeId = string;
export type EmployeeId = string;
export type StoreId = string;
export type AreaId = string;
export type OrganizationId = string;

export interface TimeRange {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export type OrganizationNodeType = "headquarter" | "area" | "store";

export interface OrganizationHeadquarterNode {
  type: "headquarter";
  id: string;
  name: string;
  children: OrganizationAreaNode[];
}

export interface OrganizationAreaNode {
  type: "area";
  id: string;
  name: string;
  manager: string;
  children: OrganizationTreeNode[];
}

export interface OrganizationStoreNode {
  type: "store";
  id: string;
  name: string;
  employees: string[];
}

export type OrganizationTreeNode = OrganizationAreaNode | OrganizationStoreNode;
