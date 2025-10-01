/**
 * Translation helpers for the HTTP adapter layer.
 * They convert between domain entities, application results, and the DTOs
 * exposed by the Express routes.
 */
import { Store } from "../../domain/entities/Store.js";
import { Employee } from "../../domain/entities/Employee.js";
import { Shift } from "../../domain/entities/Shift.js";
import { OrganizationOverview } from "../../application/getOrganizationOverview.js";
import { Timetable } from "../../application/getTimetableByStore.js";
import { ShiftRangeSummary } from "../../application/listShiftRanges.js";
import {
  StoreDTO,
  EmployeeDTO,
  ShiftDTO,
  TimetableDTO,
  ShiftRangeDTO,
  OrganizationOverviewDTO,
  OrganizationHeadquarterDTO,
  OrganizationNodeDTO
} from "./dto.js";
import {
  OrganizationHeadquarterNode,
  OrganizationTreeNode
} from "../../domain/types.js";

export const toStoreDTO = (store: Store): StoreDTO => ({
  id: store.id,
  name: store.name
});

export const toEmployeeDTO = (employee: Employee): EmployeeDTO => ({
  id: employee.id,
  name: employee.name,
  storeId: employee.storeId
});

export const toShift = (shiftDto: ShiftDTO): Shift =>
  new Shift("", shiftDto.employeeId, shiftDto.ranges);

export const toTimetableDTO = (timetable: Timetable): TimetableDTO => ({
  storeName: timetable.storeName,
  entries: timetable.entries.map(entry => ({
    name: entry.name,
    ranges: entry.ranges.map(range => ({
      start: range.start,
      end: range.end
    }))
  }))
});

export const toShiftRangeDTO = (
  shiftRange: ShiftRangeSummary
): ShiftRangeDTO => ({
  employee: shiftRange.employee,
  start: shiftRange.start,
  end: shiftRange.end
});

const mapOrganizationNodeToDTO = (
  node: OrganizationTreeNode
): OrganizationNodeDTO => {
  if (node.type === "store") {
    return {
      type: "store",
      name: node.name,
      employees: [...node.employees]
    };
  }

  return {
    type: "area",
    name: node.name,
    manager: node.manager,
    children: node.children.map(child => mapOrganizationNodeToDTO(child))
  };
};

const mapHeadquarterToDTO = (
  headquarter: OrganizationHeadquarterNode
): OrganizationHeadquarterDTO => ({
  type: "headquarter",
  name: headquarter.name,
  children: headquarter.children.map(child => mapOrganizationNodeToDTO(child))
});

export const toOrganizationOverviewDTO = (
  overview: OrganizationOverview
): OrganizationOverviewDTO => ({
  headquarter: mapHeadquarterToDTO(overview.headquarter),
  stores: overview.stores,
  employees: overview.employees,
  timetables: overview.timetables.map(timetable => toTimetableDTO(timetable))
});
