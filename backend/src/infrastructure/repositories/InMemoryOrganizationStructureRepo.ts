/**
 * Infrastructure adapter implementing the OrganizationStructureRepo port.
 * It serves a cloned, in-memory organization tree so callers can navigate it
 * without mutating the shared fixture.
 */
import { OrganizationStructureRepo } from "../../domain/ports/OrganizationStructureRepo.js";
import { OrganizationHeadquarterNode } from "../../domain/types.js";
import { organizationStructure } from "../config/organizationStructure.js";

export class InMemoryOrganizationStructureRepo
  implements OrganizationStructureRepo
{
  constructor(
    private readonly headquarter: OrganizationHeadquarterNode = organizationStructure
  ) {}

  async getHeadquarter(): Promise<OrganizationHeadquarterNode> {
    return JSON.parse(JSON.stringify(this.headquarter));
  }
}
