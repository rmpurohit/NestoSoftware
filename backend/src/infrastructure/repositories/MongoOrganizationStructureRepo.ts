/**
 * Mongo-backed OrganizationStructureRepo.
 * Stores a single headquarter document representing the full organization tree.
 * If the collection is empty, it auto-seeds from the static config so you can start immediately.
 */
import type { Db, Collection } from "mongodb";
import { OrganizationStructureRepo } from "../../domain/ports/OrganizationStructureRepo.js";
import { OrganizationHeadquarterNode } from "../../domain/types.js";
import { organizationStructure } from "../config/organizationStructure.js";

const DEFAULT_COLLECTION = process.env.MONGO_COLLECTION_ORG || "organizationStructures";

export class MongoOrganizationStructureRepo implements OrganizationStructureRepo {
  private collection: Collection<OrganizationHeadquarterNode>;

  constructor(db: Db, collectionName: string = DEFAULT_COLLECTION) {
    this.collection = db.collection<OrganizationHeadquarterNode>(collectionName);
  }

  private async ensureSeeded() {
    const count = await this.collection.countDocuments({});
    if (count === 0) {
      await this.collection.insertOne(organizationStructure);
    }
  }

  async getHeadquarter(): Promise<OrganizationHeadquarterNode> {
    await this.ensureSeeded();
    const hq =
      (await this.collection.findOne({ type: "headquarter" })) ||
      (await this.collection.findOne({}));
    if (!hq) {
      // extreme fallback
      return JSON.parse(JSON.stringify(organizationStructure));
    }
    return JSON.parse(JSON.stringify(hq));
  }
}
