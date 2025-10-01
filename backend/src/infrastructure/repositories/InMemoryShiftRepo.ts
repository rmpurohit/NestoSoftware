/**
 * Infrastructure adapter that realises the ShiftRepo port using maps.
 * It stores shift aggregates and name lookups entirely in memory to support
 * tests and demos without external services.
 */
import { Shift } from "../../domain/entities/Shift.js";
import { ShiftRepo } from "../../domain/ports/ShiftRepo.js";
import { TimeRange } from "../../domain/types.js";

interface ShiftRecord {
  employeeId: string;
  employeeName: string;
  ranges: TimeRange[];
}

const initialShifts: ShiftRecord[] = [
  {
    employeeId: "employee-claus",
    employeeName: "Claus",
    ranges: [{ start: "08:00", end: "16:00" }]
  },
  {
    employeeId: "employee-claire",
    employeeName: "Claire",
    ranges: [{ start: "10:00", end: "14:00" }]
  },
  {
    employeeId: "employee-daisy",
    employeeName: "Daisy",
    ranges: [{ start: "12:00", end: "20:00" }]
  },
  {
    employeeId: "employee-daniel",
    employeeName: "Daniel",
    ranges: [
      { start: "11:00", end: "13:00" },
      { start: "15:00", end: "21:00" }
    ]
  },
  {
    employeeId: "employee-emil",
    employeeName: "Emil",
    ranges: [{ start: "13:00", end: "23:00" }]
  },
  {
    employeeId: "employee-fred",
    employeeName: "Fred",
    ranges: [{ start: "12:00", end: "18:00" }]
  }
];

const cloneShift = (shift: Shift): Shift =>
  new Shift(
    shift.id,
    shift.employeeId,
    shift.ranges.map(range => ({ ...range }))
  );

const buildShiftId = (employeeId: string) => `shift-${employeeId}`;

export class InMemoryShiftRepo implements ShiftRepo {
  private readonly shifts = new Map<string, Shift>();
  private readonly employeeNameById = new Map<string, string>();
  private readonly employeeIdByName = new Map<string, string>();

  constructor(initialShiftsData: ShiftRecord[] = initialShifts) {
    initialShiftsData.forEach(shiftRecord => {
      const shiftId = buildShiftId(shiftRecord.employeeId);
      const shift = new Shift(shiftId, shiftRecord.employeeId, shiftRecord.ranges);
      this.shifts.set(shiftRecord.employeeId, shift);
      this.employeeNameById.set(shiftRecord.employeeId, shiftRecord.employeeName);
      this.employeeIdByName.set(
        shiftRecord.employeeName.toLowerCase(),
        shiftRecord.employeeId
      );
    });
  }

  async upsert(shift: Shift): Promise<void> {
    const existingShift = this.shifts.get(shift.employeeId);
    const shiftId = shift.id || existingShift?.id || buildShiftId(shift.employeeId);
    const shiftToPersist = new Shift(
      shiftId,
      shift.employeeId,
      shift.ranges.map(range => ({ ...range }))
    );
    this.shifts.set(shift.employeeId, shiftToPersist);

    const employeeName = this.employeeNameById.get(shift.employeeId);

    if (employeeName) {
      this.employeeIdByName.set(employeeName.toLowerCase(), shift.employeeId);
    }
  }

  async getByEmployee(employeeId: string): Promise<Shift | null> {
    const shift = this.shifts.get(employeeId);
    return shift ? cloneShift(shift) : null;
  }

  async getByEmployeeName(employeeName: string): Promise<Shift | null> {
    const employeeId = this.employeeIdByName.get(employeeName.toLowerCase());
    if (!employeeId) {
      return null;
    }

    return this.getByEmployee(employeeId);
  }
}
