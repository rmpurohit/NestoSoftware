/**
 * Infrastructure configuration adapter providing seed domain data.
 * It exports a static organization tree used by in-memory repositories to
 * emulate persistent storage.
 */
import { OrganizationHeadquarterNode } from "../../domain/types.js";

export const organizationStructure: OrganizationHeadquarterNode = {
  type: "headquarter",
  id: "hq-bestfood",
  name: "BestFood Company",
  children: [
    {
      type: "area",
      id: "area-deutschland",
      name: "Deutschland",
      manager: "Alice",
      children: [
        {
          type: "area",
          id: "area-nord",
          name: "Nord",
          manager: "Carol",
          children: [
            {
              type: "store",
              id: "store-hamburg",
              name: "Hamburg",
              employees: ["Claus", "Claire"]
            },
            {
              type: "store",
              id: "store-stuttgart",
              name: "Stuttgart",
              employees: ["Emil"]
            }
          ]
        },
        {
          type: "area",
          id: "area-sued",
          name: "Süd",
          manager: "Bob",
          children: [
            {
              type: "store",
              id: "store-karlsruhe",
              name: "Karlsruhe",
              employees: ["Daisy", "Daniel"]
            },
            {
              type: "store",
              id: "store-muenchen",
              name: "München",
              employees: ["Fred"]
            }
          ]
        }
      ]
    }
  ]
};
