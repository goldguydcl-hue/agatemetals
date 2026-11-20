import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  PricesResponse,
  ShareRequest,
  ShareResponse,
} from '../../shared/api';
import { METAL_LABELS } from '../../shared/metals';
import { getModeratorPrices, getPrices } from '../prices';

type ErrorResponse = {
  status: 'error';
  message: string;
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

api.post('/share', async (c) => {
  try {
    const body = await c.req.json<ShareRequest>();
    const metalLabel = METAL_LABELS[body.metal] ?? body.metal;
    const unitLabel = body.unit === 'g' ? 'g' : 'troy oz';
    const value = Number.isFinite(body.estimatedValue)
      ? body.estimatedValue
      : 0;
    const title = `My ${body.weight} ${unitLabel} of ${metalLabel} is worth about $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
