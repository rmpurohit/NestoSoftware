/**
 * Domain entity describing an employee aggregate.
 * It carries immutable identity, display name, and the store affiliation.
 */
export class Employee {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly storeId: string
  ) {}
}
