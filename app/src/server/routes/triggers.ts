import { Hono } from 'hono';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';
import {
  SEED_MODERATOR_PRICES,
  getModeratorPrices,
  setModeratorPrices,
} from '../prices';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  try {
    // Seed daily reference prices on first install so the fallback leg is
    // never empty. Existing values are never overwritten on upgrade.
    const existing = await getModeratorPrices();
    const hasAny = Object.values(existing).some(
      (value) => typeof value === 'number'
    );
    if (!hasAny) {
      await setModeratorPrices(SEED_MODERATOR_PRICES);
    }

    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Post created in subreddit ${context.subredditName} with id ${post.id} (trigger: ${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error(`Error on app install: ${error}`);
    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to install app',
      },
      400
    );
  }
});
