/**
 * Domain entity for the overall organization aggregate.
 * It encapsulates the company identity, name, and root area linkage.
 */
export class Organization {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly rootAreaId: string
  ) {}
}
