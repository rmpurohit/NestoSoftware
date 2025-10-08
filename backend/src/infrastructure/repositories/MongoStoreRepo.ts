/**
 * StoreRepo implementation derived from an OrganizationStructureRepo.
 * It materializes Store entities by traversing the organization tree
 * regardless of whether the tree comes from memory or MongoDB.
 */
import { Store } from "../../domain/entities/Store.js";
import { StoreRepo } from "../../domain/ports/StoreRepo.js";
import { OrganizationStructureRepo } from "../../domain/ports/OrganizationStructureRepo.js";
import {
  OrganizationHeadquarterNode,
  OrganizationTreeNode,
  OrganizationStoreNode
} from "../../domain/types.js";

const cloneStore = (store: Store) => new Store(store.id, store.name);

const collectStoreNodes = (nodes: OrganizationTreeNode[]): OrganizationStoreNode[] =>
  nodes.flatMap(node =>
    node.type === "store" ? [node] : collectStoreNodes(node.children)
  );

export class MongoStoreRepo implements StoreRepo {
  constructor(private readonly orgRepo: OrganizationStructureRepo) {}

  private async computeStores(): Promise<{ byId: Map<string, Store>; byName: Map<string, Store> }> {
    const hq: OrganizationHeadquarterNode = await this.orgRepo.getHeadquarter();
    const stores = collectStoreNodes(hq.children).map(
      s => new Store(s.id, s.name)
    );
    return {
      byId: new Map(stores.map(s => [s.id, s])),
      byName: new Map(stores.map(s => [s.name.toLowerCase(), s]))
    };
  }

  async list(): Promise<Store[]> {
    const { byId } = await this.computeStores();
    return Array.from(byId.values()).map(cloneStore);
  }

  async getById(id: string): Promise<Store | null> {
    const { byId } = await this.computeStores();
    const store = byId.get(id);
    return store ? cloneStore(store) : null;
  }

  async getByName(name: string): Promise<Store | null> {
    const { byName } = await this.computeStores();
    const store = byName.get(name.toLowerCase());
    return store ? cloneStore(store) : null;
  }
}
