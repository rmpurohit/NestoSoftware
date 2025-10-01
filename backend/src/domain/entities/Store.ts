/**
 * Domain entity modelling a retail store.
 * It tracks the store's identity, name, and the employees assigned to it.
 */
export class Store {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly employeeIds: string[] = []
  ) {}
}
