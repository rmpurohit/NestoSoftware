export interface TimeRange {
  start: string;
  end: string;
}

export interface TimetableEntry {
  name: string;
  ranges: TimeRange[];
}

export interface Timetable {
  storeName: string;
  entries: TimetableEntry[];
}

export interface OrganizationStoreNode {
  type: "store";
  name: string;
  employees: string[];
}

export interface OrganizationAreaNode {
  type: "area";
  name: string;
  manager: string;
  children: OrganizationNode[];
}

export interface OrganizationHeadquarterNode {
  type: "headquarter";
  name: string;
  children: OrganizationNode[];
}

export type OrganizationNode =
  | OrganizationStoreNode
  | OrganizationAreaNode;

export interface OrganizationOverview {
  headquarter: OrganizationHeadquarterNode;
  stores: string[];
  employees: string[];
  timetables: Timetable[];
}
