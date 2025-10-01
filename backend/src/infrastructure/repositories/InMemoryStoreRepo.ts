/**
 * Infrastructure adapter implementing the StoreRepo port in memory.
 * It materializes store entities from the configuration tree and serves
 * them to the application without a real database.
 */
import { Store } from "../../domain/entities/Store.js";
import { StoreRepo } from "../../domain/ports/StoreRepo.js";
import {
  OrganizationHeadquarterNode,
  OrganizationStoreNode,
  OrganizationTreeNode
} from "../../domain/types.js";
import { organizationStructure } from "../config/organizationStructure.js";

const collectStoreNodes = (
  nodes: OrganizationTreeNode[]
): OrganizationStoreNode[] =>
  nodes.flatMap(node => {
    if (node.type === "store") {
      return [node];
    }

    return collectStoreNodes(node.children);
  });

const cloneStore = (store: Store): Store =>
  new Store(store.id, store.name, [...store.employeeIds]);

export class InMemoryStoreRepo implements StoreRepo {
  private readonly storesById = new Map<string, Store>();
  private readonly storesByName = new Map<string, Store>();

  constructor(headquarter: OrganizationHeadquarterNode = organizationStructure) {
    const storeNodes = collectStoreNodes(headquarter.children);

    storeNodes.forEach(storeNode => {
      const store = new Store(storeNode.id, storeNode.name);
      this.storesById.set(store.id, store);
      this.storesByName.set(store.name.toLowerCase(), store);
    });
  }

  async list(): Promise<Store[]> {
    return Array.from(this.storesById.values()).map(cloneStore);
  }

  async getById(id: string): Promise<Store | null> {
    const store = this.storesById.get(id);
    return store ? cloneStore(store) : null;
  }

  async getByName(name: string): Promise<Store | null> {
    const store = this.storesByName.get(name.toLowerCase());
    return store ? cloneStore(store) : null;
  }
}
