/**
 * Application use case that queries the store port.
 * It delegates to the injected StoreRepo adapter to list all stores.
 */
import { StoreRepo } from "../domain/ports/StoreRepo.js";

export const listStores = (storeRepository: StoreRepo) => {
  return () => storeRepository.list();
};
