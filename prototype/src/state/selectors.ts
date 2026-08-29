import { ALL_PROFILES, CHILDREN } from "../data/mock";
import type { Child, DayEvent, Message, Profile } from "../data/types";
import { toISODate } from "../lib/format";

export function getChild(id: string | undefined): Child | undefined {
  return CHILDREN.find((c) => c.id === id);
}

export function getProfile(id: string): Profile | undefined {
  return ALL_PROFILES.find((p) => p.id === id);
}

export function authorFirstName(id: string): string {
  return getProfile(id)?.firstName ?? "Équipe";
}

/** Enfants visibles pour un utilisateur : tous si staff, ses rattachements si parent. */
export function visibleChildren(user: Profile | null): Child[] {
  if (!user) return [];
  if (user.role === "staff") return CHILDREN;
  return CHILDREN.filter((c) => c.familyProfileIds.includes(user.id));
}

export function isChildLinkedToParent(child: Child, user: Profile | null): boolean {
  return !!user && child.familyProfileIds.includes(user.id);
}

export function eventsForChildOnDate(
  events: DayEvent[],
  childId: string,
  isoDate: string,
): DayEvent[] {
  return events
    .filter((e) => e.childId === childId && toISODate(new Date(e.createdAt)) === isoDate)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function lastEventForChild(
  events: DayEvent[],
  childId: string,
  isoDate: string,
): DayEvent | undefined {
  return eventsForChildOnDate(events, childId, isoDate)[0];
}

export function countEventsForChild(
  events: DayEvent[],
  childId: string,
  isoDate: string,
): number {
  return events.filter(
    (e) => e.childId === childId && toISODate(new Date(e.createdAt)) === isoDate,
  ).length;
}

/** Messages recus par l'equipe, tries du plus recent au plus ancien. */
export function inboxMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function unreadMessagesForChild(messages: Message[], childId: string): Message[] {
  return inboxMessages(messages).filter(
    (m) => m.childId === childId && m.status !== "traité",
  );
}

/** Historique des messages envoyes par un parent. */
export function sentMessages(messages: Message[], parentId: string): Message[] {
  return inboxMessages(messages).filter((m) => m.fromProfileId === parentId);
}
