/**
 * Application use case responsible for writing through the shift port.
 * It constructs a domain Shift aggregate and asks the ShiftRepo adapter to
 * persist it, leaving validation hooks for future rules.
 */
import { Shift } from "../domain/entities/Shift.js";
import { ShiftRepo } from "../domain/ports/ShiftRepo.js";
import { TimeRange } from "../domain/types.js";

export interface UpsertShiftsCommand {
  employeeId: string;
  ranges: TimeRange[];
  shiftId?: string;
}

export const upsertShifts = (shiftRepository: ShiftRepo) =>
  async ({ shiftId = "", employeeId, ranges }: UpsertShiftsCommand) => {
    const shiftToSave = new Shift(shiftId, employeeId, ranges);
    await shiftRepository.upsert(shiftToSave);
  };
