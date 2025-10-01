/**
 * Data transfer object definitions for the HTTP adapter.
 * They describe the serialized shapes sent to front-end consumers.
 */
export interface StoreDTO {
  id: string;
  name: string;
}

export interface EmployeeDTO {
  id: string;
  name: string;
  storeId: string;
}

export interface ShiftDTO {
  employeeId: string;
  ranges: { start: string; end: string }[];
}

export interface TimetableEntryDTO {
  name: string;
  ranges: { start: string; end: string }[];
}

export interface TimetableDTO {
  storeName: string;
  entries: TimetableEntryDTO[];
}

export interface ShiftRangeDTO {
  employee: string;
  start: string;
  end: string;
}

export type OrganizationNodeDTO = OrganizationAreaDTO | OrganizationStoreDTO;

export interface OrganizationHeadquarterDTO {
  type: "headquarter";
  name: string;
  children: OrganizationNodeDTO[];
}

export interface OrganizationAreaDTO {
  type: "area";
  name: string;
  manager: string;
  children: OrganizationNodeDTO[];
}

export interface OrganizationStoreDTO {
  type: "store";
  name: string;
  employees: string[];
}

export interface OrganizationOverviewDTO {
  headquarter: OrganizationHeadquarterDTO;
  stores: string[];
  employees: string[];
  timetables: TimetableDTO[];
}
