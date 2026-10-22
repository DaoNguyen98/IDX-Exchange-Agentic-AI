import { parsePropertyQuery } from "../../week-02/src/property-parser";

import {
  searchActiveListings,
  formatPropertyCard,
} from "../../week-03/src/property-search";

import {
  getSession,
  updateSession,
} from "./session";

export async function handlePropertyConversation(
  userId: string,
  message: string
): Promise<string> {
  const parsed = await parsePropertyQuery(message);

  const updates: Record<string, unknown> = {};

  if (parsed.city) updates.city = parsed.city;
  if (parsed.minPrice) updates.minPrice = parsed.minPrice;
  if (parsed.maxPrice) updates.maxPrice = parsed.maxPrice;
  if (parsed.beds) updates.beds = parsed.beds;
  if (parsed.baths) updates.baths = parsed.baths;
  if (parsed.type) updates.type = parsed.type;
  if (parsed.pool) updates.pool = parsed.pool;
  if (parsed.hasView) updates.hasView = parsed.hasView;
  if (parsed.maxHoa) updates.maxHoa = parsed.maxHoa;

  const updatedSession = updateSession(userId, updates);

  if (!updatedSession.city) {
    return "What city are you interested in?";
  }

  if (!updatedSession.minPrice && !updatedSession.maxPrice) {
    return "What is your budget?";
  }

  if (!updatedSession.type) {
    return "Any preferences — condo, townhome, single family, or land?";
  }

  if (
    !updatedSession.beds &&
    updatedSession.type !== "UnimprovedLand"
  ) {
    return "How many bedrooms do you need?";
  }

  const listings = await searchActiveListings(
    {
      city: updatedSession.city ?? null,
      minPrice: updatedSession.minPrice ?? null,
      maxPrice: updatedSession.maxPrice ?? null,
      beds: updatedSession.beds ?? null,
      baths: updatedSession.baths ?? null,
      sqft: null,
      type: updatedSession.type ?? null,
      pool: updatedSession.pool ?? null,
      hasView: updatedSession.hasView ?? null,
      maxHoa: updatedSession.maxHoa ?? null,
    },
    1,
    5
  );

  updateSession(userId, {
    lastResults: listings,
    conversationStep: updatedSession.conversationStep + 1,
  });

  if (listings.length === 0) {
    return "I couldn't find any matching properties. Try changing one of your preferences.";
  }

  return listings.map(formatPropertyCard).join("\n\n");
}