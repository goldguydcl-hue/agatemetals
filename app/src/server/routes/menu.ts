import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';
import { getModeratorPrices } from '../prices';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create post',
      },
      400
    );
  }
});

menu.post('/fallback-prices', async (c) => {
  try {
    const current = await getModeratorPrices();
    return c.json<UiResponse>(
      {
        showForm: {
          name: 'fallbackPricesForm',
          form: {
            title: 'Update fallback prices',
            fields: [
              {
                name: 'gold',
                label: 'Gold — USD per troy oz',
                type: 'number',
                defaultValue: current.gold ?? undefined,
              },
              {
                name: 'silver',
                label: 'Silver — USD per troy oz',
                type: 'number',
                defaultValue: current.silver ?? undefined,
              },
              {
                name: 'platinum',
                label: 'Platinum — USD per troy oz',
                type: 'number',
                defaultValue: current.platinum ?? undefined,
              },
              {
                name: 'palladium',
                label: 'Palladium — USD per troy oz',
                type: 'number',
                defaultValue: current.palladium ?? undefined,
              },
              {
                name: 'rhodium',
                label: 'Rhodium — USD per troy oz',
                type: 'number',
                defaultValue: current.rhodium ?? undefined,
              },
            ],
          },
        },
      },
      200
    );
  } catch (error) {
    console.error(`Error opening fallback prices form: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to open fallback prices',
      },
      400
    );
  }
});
