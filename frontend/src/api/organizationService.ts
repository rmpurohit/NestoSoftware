import type {
  OrganizationOverview,
  Timetable
} from "@/types/organization";
import { apiGet } from "./httpClient";

export const fetchOrganizationOverview = () =>
  apiGet<OrganizationOverview>("/organization/overview");

export const fetchTimetableForStore = (storeName: string) =>
  apiGet<Timetable>(`/timetable/${encodeURIComponent(storeName)}`);
