/**
 * Domain port for retrieving organization aggregates.
 * Implementations hide storage details while supplying the core with the
 * default organization view.
 */
import { Organization } from "../entities/Organization.js";
export interface OrganizationRepo {
  getDefault(): Promise<Organization | null>;
}
