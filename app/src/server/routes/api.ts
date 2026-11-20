import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  PricesResponse,
  ShareRequest,
  ShareResponse,
} from '../../shared/api';
import { isRecord } from '../../shared/api';
import { METAL_LABELS } from '../../shared/metals';
import { parseCollectionLines } from '../../shared/presets';
import type { CollectionLine } from '../../shared/presets';
import { clearCollection, getCollection, saveCollection } from '../collection';
import { getModeratorPrices, getPrices } from '../prices';

type ErrorResponse = {
  status: 'error';
  message: string;
};

type CollectionResponse = {
  type: 'collection';
  items: CollectionLine[];
  saved: boolean;
};

export const api = new Hono();

api.get('/prices', async (c) => {
  try {
    const result = await getPrices();
    return c.json<PricesResponse>({
      type: 'prices',
      prices: result.prices,
      fetchedAt: result.fetchedAt,
      cacheHit: result.cacheHit,
    });
  } catch (error) {
    console.error('API prices error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load prices' },
      500
    );
  }
});

api.get('/moderator-prices', async (c) => {
  try {
    const prices = await getModeratorPrices();
    return c.json({ type: 'moderator-prices', prices });
  } catch (error) {
    console.error('API moderator-prices error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load reference prices' },
      500
    );
  }
});

api.get('/collection', async (c) => {
  try {
    const items = await getCollection();
    if (items === null) {
      return c.json<ErrorResponse>(
        {
          status: 'error',
          message: 'Sign in to Reddit to save your collection',
        },
        401
      );
    }
    return c.json<CollectionResponse>({
      type: 'collection',
      items,
      saved: true,
    });
  } catch (error) {
    console.error('API collection get error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load collection' },
      500
    );
  }
});

api.put('/collection', async (c) => {
  try {
    const body: unknown = await c.req.json();
    if (!isRecord(body)) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Collection must be an object' },
        400
      );
    }
    const items = parseCollectionLines(body.items);
    if (items === null) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Collection items were not valid' },
        400
      );
    }
    const saved = await saveCollection(items);
    if (!saved) {
      return c.json<ErrorResponse>(
        {
          status: 'error',
          message: 'Sign in to Reddit to save your collection',
        },
        401
      );
    }
    return c.json<CollectionResponse>({
      type: 'collection',
      items,
      saved: true,
    });
  } catch (error) {
    console.error('API collection put error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to save collection' },
      500
    );
  }
});

api.delete('/collection', async (c) => {
  try {
    const cleared = await clearCollection();
    if (!cleared) {
      return c.json<ErrorResponse>(
        {
          status: 'error',
          message: 'Sign in to Reddit to save your collection',
        },
        401
      );
    }
    return c.json<CollectionResponse>({
      type: 'collection',
      items: [],
      saved: true,
    });
  } catch (error) {
    console.error('API collection delete error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to clear collection' },
      500
    );
  }
});

api.post('/share', async (c) => {
  try {
    const body = await c.req.json<ShareRequest>();
    const metalLabel = METAL_LABELS[body.metal] ?? body.metal;
    const unitLabel = body.unit === 'g' ? 'g' : 'troy oz';
    const value = Number.isFinite(body.estimatedValue)
      ? body.estimatedValue
      : 0;
    const customTitle =
      typeof body.title === 'string' && body.title.trim().length > 0
        ? body.title.trim().slice(0, 200)
        : null;
    const title =
      customTitle ??
      `My ${body.weight} ${unitLabel} of ${metalLabel} is worth about $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const post = await reddit.submitCustomPost({ title });
    return c.json<ShareResponse>({
      type: 'share',
      postId: post.id,
      url: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error('API share error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to share result' },
      500
    );
  }
});
