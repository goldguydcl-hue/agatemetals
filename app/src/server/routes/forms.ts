import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import type { MetalKey, ModeratorPrices } from '../../shared/api';
import { getModeratorPrices, setModeratorPrices } from '../prices';

type FallbackPricesFormValues = {
  gold?: number | string;
  silver?: number | string;
  platinum?: number | string;
  palladium?: number | string;
  rhodium?: number | string;
};

const toPrice = (value: number | string | undefined): number | null => {
  if (value === undefined || value === '') {
    return null;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

export const forms = new Hono();

forms.post('/fallback-prices-submit', async (c) => {
  const values = await c.req.json<FallbackPricesFormValues>();
  const current = await getModeratorPrices();
  const next: ModeratorPrices = { ...current };
  const keys: MetalKey[] = [
    'gold',
    'silver',
    'platinum',
    'palladium',
    'rhodium',
  ];
  for (const key of keys) {
    const parsed = toPrice(values[key]);
    if (parsed !== null) {
      next[key] = parsed;
    }
  }
  await setModeratorPrices(next);

  return c.json<UiResponse>(
    {
      showToast: 'Fallback prices updated',
    },
    200
  );
});
