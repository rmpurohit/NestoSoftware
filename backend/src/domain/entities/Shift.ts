/**
 * Domain entity representing a shift aggregate.
 * It holds the business identity for an employee's scheduled time ranges.
 */
import { TimeRange } from "../types.js";

export class Shift {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly ranges: TimeRange[]
  ) {}
}
