import { context, redis } from '@devvit/web/server';
import type { CollectionLine } from '../shared/presets';
import { parseCollectionLines } from '../shared/presets';

/**
 * Per-user collection persistence (Redis).
 * Key is scoped to the viewing user (Reddit user id, falling back to the
 * logged-out LOID token) so one user's collection never leaks to another,
 * and it survives reloads and new posts. Returns null when there is no
 * identity to scope the key to — the client then keeps the collection in
 * memory only and tells the user to sign in to save it.
 */
const keyForUser = (): string | null => {
  const id = context.userId ?? context.loid;
  return id ? `collection:${id}` : null;
};

export const getCollection = async (): Promise<CollectionLine[] | null> => {
  const key = keyForUser();
  if (key === null) {
    return null;
  }
  const raw = await redis.get(key);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return parseCollectionLines(parsed) ?? [];
  } catch {
    return [];
  }
};

export const saveCollection = async (
  lines: CollectionLine[]
): Promise<boolean> => {
  const key = keyForUser();
  if (key === null) {
    return false;
  }
  await redis.set(key, JSON.stringify(lines));
  return true;
};

export const clearCollection = async (): Promise<boolean> => {
  const key = keyForUser();
  if (key === null) {
    return false;
  }
  await redis.del(key);
  return true;
};
