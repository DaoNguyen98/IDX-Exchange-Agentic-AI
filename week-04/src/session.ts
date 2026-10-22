import type { ListingRow } from "../../week-03/src/property-search";

export interface UserSession {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  type?: string;
  pool?: string;
  hasView?: string;
  maxHoa?: number;
  lastResults?: ListingRow[];
  conversationStep: number;
}

const sessions = new Map<string, UserSession>();

export function getSession(userId: string): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      conversationStep: 0,
    });
  }

  return sessions.get(userId)!;
}

export function updateSession(
  userId: string,
  updates: Partial<UserSession>
): UserSession {
  const currentSession = getSession(userId);

  const updatedSession: UserSession = {
    ...currentSession,
    ...updates,
  };

  sessions.set(userId, updatedSession);

  return updatedSession;
}

export function clearSession(userId: string): void {
  sessions.delete(userId);
}