/**
 * Mongo-backed ShiftRepo.
 * Stores one document per employee containing the latest shift ranges.
 */
import type { Db, Collection, WithId } from "mongodb";
import { Shift } from "../../domain/entities/Shift.js";
import { ShiftRepo } from "../../domain/ports/ShiftRepo.js";
import { TimeRange } from "../../domain/types.js";

type ShiftDoc = {
  _id: string; // employeeId
  shiftId?: string;
  employeeId: string;
  employeeName?: string;
  employeeNameLower?: string;
  ranges: TimeRange[];
};

const DEFAULT_COLLECTION = process.env.MONGO_COLLECTION_SHIFTS || "shifts";

const toDomain = (doc: WithId<ShiftDoc>): Shift =>
  new Shift(doc.shiftId || "", doc.employeeId, doc.ranges);

const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
const idFromName = (name: string) => `employee-${slug(name)}`;

export class MongoShiftRepo implements ShiftRepo {
  private collection: Collection<ShiftDoc>;

  constructor(db: Db, collectionName: string = DEFAULT_COLLECTION) {
    this.collection = db.collection<ShiftDoc>(collectionName);
    // helpful index for name lookups
    this.collection.createIndex({ employeeNameLower: 1 }, { unique: false }).catch(() => {});
  }

  async upsert(shift: Shift): Promise<void> {
    const update: Partial<ShiftDoc> = {
      _id: shift.employeeId,
      employeeId: shift.employeeId,
      shiftId: shift.id,
      ranges: shift.ranges
    };
    await this.collection.updateOne(
      { _id: shift.employeeId },
      { $set: update },
      { upsert: true }
    );
  }

  async getByEmployee(employeeId: string): Promise<Shift | null> {
    const doc = await this.collection.findOne({ _id: employeeId });
    return doc ? toDomain(doc as WithId<ShiftDoc>) : null;
  }

  async getByEmployeeName(employeeName: string): Promise<Shift | null> {
    // 1) Try deterministic id derived from name (works with DerivedEmployeeRepo).
    const candidateId = idFromName(employeeName);
    const byId = await this.collection.findOne({ _id: candidateId });
    if (byId) return toDomain(byId as WithId<ShiftDoc>);

    // 2) Fallback to name lookup if you stored names with setEmployeeName.
    const doc = await this.collection.findOne({
      employeeNameLower: employeeName.toLowerCase()
    });
    return doc ? toDomain(doc as WithId<ShiftDoc>) : null;
  }

  /**
   * Optional convenience helper for storing name alongside a shift.
   * You can call this after creating employees if you want name lookups.
   */
  async setEmployeeName(employeeId: string, name: string) {
    await this.collection.updateOne(
      { _id: employeeId },
      {
        $set: {
          employeeName: name,
          employeeNameLower: name.toLowerCase()
        }
      },
      { upsert: true }
    );
  }
}
