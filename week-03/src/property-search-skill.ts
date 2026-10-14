import { parsePropertyQuery } from "../../week-02/src/property-parser";
import {
  searchActiveListings,
  formatPropertyCard,
} from "./property-search";

export async function runPropertySearchSkill(
  userQuery: string,
  page = 1,
  limit = 5
): Promise<string[]> {
  const filters = await parsePropertyQuery(userQuery);

  const listings = await searchActiveListings(
    filters,
    page,
    limit
  );

  return listings.map(formatPropertyCard);
}