/**
 * Domain port defining the persistence contract for stores.
 * Infrastructure adapters implement this interface to supply store data to
 * application services.
 */
import { Store } from "../entities/Store.js";
export interface StoreRepo {
  list(): Promise<Store[]>;
  getById(id: string): Promise<Store | null>;
  getByName(name: string): Promise<Store | null>;
}
