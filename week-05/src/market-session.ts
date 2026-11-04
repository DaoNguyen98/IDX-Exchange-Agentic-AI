export interface MarketSession {
  city?: string;
  postalCode?: string;
  propertySubType?: string;
  pendingQuestion?: string;
}

const sessions = new Map<string, MarketSession>();

export function getMarketSession(
  userId: string
): MarketSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {});
  }

  return sessions.get(userId)!;
}

export function updateMarketSession(
  userId: string,
  updates: Partial<MarketSession>
): MarketSession {
  const current = getMarketSession(userId);

  const updated = {
    ...current,
    ...updates,
  };

  sessions.set(userId, updated);

  return updated;
}

export function clearMarketSession(
  userId: string
): void {
  sessions.delete(userId);
}