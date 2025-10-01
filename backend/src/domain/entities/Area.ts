/**
 * Domain entity capturing an organizational area.
 * It stores the area's identity, manager, and child node references.
 */
export class Area {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly manager: string,
    public readonly children: Array<{ type: "area" | "store"; id: string }>
  ) {}
}
