import { dealerPrice, estimateValue } from './metals';
import {
  ALL_PURITY_OPTIONS,
  CUSTOM_PRESET_ID,
  PRESETS,
  PURITY_GROUPS,
  findPreset,
  findPurityOption,
  findPurityOptionForMetal,
  lineDealerValue,
  lineValue,
  parseCollectionLines,
  presetUnitValue,
} from './presets';
import type { CollectionLine, Preset } from './presets';

/**
 * Hand-computed checks for the preset table, purity picker and collection
 * math. This file runs as a plain script (no node:test import — the
 * template's bundler module resolution does not resolve `node:` specifiers):
 * `node --test` executes it and fails the run if any check throws.
 * Run it bundled: esbuild presets.test.ts --bundle --platform=node
 * --format=esm --outfile=/tmp/checker-presets.test.mjs && node --test
 * /tmp/checker-presets.test.mjs
 * (The repo's `npm run test:unit` cannot resolve the codebase's
 * extensionless relative imports under --experimental-strip-types, so the
 * bundle step is the working runner. See BUILD-REPORT.md.)
 */

// Minimal assertions (no node: imports — the template's bundler module
// resolution does not resolve node: specifiers under tsc).
const assert = {
  equal: (actual: unknown, expected: unknown, message?: string): void => {
    if (actual !== expected) {
      throw new Error(
        message ?? `expected ${String(expected)}, got ${String(actual)}`
      );
    }
  },
  notEqual: (actual: unknown, expected: unknown, message?: string): void => {
    if (actual === expected) {
      throw new Error(message ?? `did not expect ${String(actual)}`);
    }
  },
  ok: (value: unknown, message?: string): void => {
    if (!value) {
      throw new Error(
        message ?? `expected a truthy value, got ${String(value)}`
      );
    }
  },
  deepEqual: (actual: unknown, expected: unknown, message?: string): void => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        message ??
          `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
  },
};

/** Money to the cent, as the UI formats it. */
const usd = (value: number): string => value.toFixed(2);

const mustPreset = (id: string): Preset => {
  const preset = findPreset(id);
  if (preset === null) {
    throw new Error(`missing preset ${id}`);
  }
  return preset;
};

const closeTo = (actual: number, expected: number, tolerance: number) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

const check = (name: string, fn: () => void): void => {
  fn();
  console.log(`ok - ${name}`);
};

// Live-app numbers reproduced from implied spot prices.
check('Silver Eagle, dime and $1 face at silver $41.62/ozt', () => {
  const silver = 41.62;
  const eagle = mustPreset('silver-eagle');
  const dime = mustPreset('dime-90');
  const face = mustPreset('face-1');
  assert.equal(usd(presetUnitValue(eagle, silver) ?? 0), '41.58');
  assert.equal(usd(presetUnitValue(dime, silver) ?? 0), '3.01');
  assert.equal(usd(presetUnitValue(face, silver) ?? 0), '29.76');
  assert.equal(usd(dealerPrice(presetUnitValue(eagle, silver) ?? 0)), '39.50');
  assert.equal(usd(dealerPrice(presetUnitValue(dime, silver) ?? 0)), '2.86');
  assert.equal(usd(dealerPrice(presetUnitValue(face, silver) ?? 0)), '28.27');
});

check('1/2 gram gold bar at gold $3,549.40/ozt', () => {
  const bar = mustPreset('gold-bar-half-gram');
  assert.equal(usd(presetUnitValue(bar, 3549.4) ?? 0), '57.05');
  assert.equal(usd(dealerPrice(presetUnitValue(bar, 3549.4) ?? 0)), '54.20');
});

check('1 oz rhodium bar at the $4,500/ozt fallback', () => {
  const bar = mustPreset('rhodium-bar');
  assert.equal(usd(presetUnitValue(bar, 4500) ?? 0), '4495.50');
  assert.equal(usd(dealerPrice(presetUnitValue(bar, 4500) ?? 0)), '4270.73');
});

// Table prices (gold-api.com, Nov 20, 2026).
check('gold presets at $3,559.22/ozt match the purity table melts', () => {
  const gold = 3559.22;
  closeTo(presetUnitValue(mustPreset('gold-eagle'), gold) ?? 0, 3559.34, 0.05);
  closeTo(
    presetUnitValue(mustPreset('gold-buffalo'), gold) ?? 0,
    3558.86,
    0.05
  );
  closeTo(presetUnitValue(mustPreset('gold-10k'), gold) ?? 0, 47.68, 0.05);
  closeTo(presetUnitValue(mustPreset('gold-14k'), gold) ?? 0, 66.75, 0.05);
  closeTo(presetUnitValue(mustPreset('gold-24k'), gold) ?? 0, 114.42, 0.05);
});

check('platinum and palladium eagles match the purity table melts', () => {
  closeTo(
    presetUnitValue(mustPreset('platinum-eagle'), 1300.15) ?? 0,
    1299.5,
    0.05
  );
  closeTo(
    presetUnitValue(mustPreset('palladium-eagle'), 884.75) ?? 0,
    884.31,
    0.05
  );
});

check('1 oz gold at 22k is 91.67% of the 24k value', () => {
  const gold = 3559.22;
  const at22k = estimateValue(gold, 1, 'oz', 91.67, 0);
  const at24k = estimateValue(gold, 1, 'oz', 99.99, 0);
  closeTo(at22k / at24k, 91.67 / 99.99, 0.0001);
  assert.equal(usd(at22k), '3262.74');
  assert.equal(usd(at24k), '3558.86');
});

// Preset list.
check(
  '37 presets: Custom Item first, the live 30 in order, then Joe’s 7',
  () => {
    assert.equal(PRESETS.length, 37);
    assert.equal(PRESETS[0]?.id, CUSTOM_PRESET_ID);
    assert.equal(PRESETS[1]?.name, '1 oz Silver Eagle');
    assert.equal(PRESETS[11]?.name, '$1 Face Value 90% Silver');
    assert.equal(PRESETS[12]?.name, '1 oz Gold Eagle');
    assert.equal(PRESETS[29]?.name, '1 oz Rhodium Bar');
    assert.equal(PRESETS[30]?.name, '10k Gold');
    assert.equal(PRESETS[36]?.name, '$10 Face Value 90% Silver');
  }
);

check('90% silver items store pure weight at 100% purity', () => {
  for (const id of [
    'dime-90',
    'quarter-90',
    'half-90',
    'face-1',
    'kennedy-40',
    'war-nickel',
    'face-10',
  ]) {
    const preset = findPreset(id);
    assert.ok(preset !== null, id);
    assert.equal(preset?.purity, 100);
    assert.equal(preset?.unit, 'oz');
  }
  assert.equal(findPreset('dime-90')?.weight, 0.0723);
  assert.equal(findPreset('quarter-90')?.weight, 0.1808);
  assert.equal(findPreset('face-10')?.weight, 7.15);
});

check('Gold Eagle stores grams at 22k, not 1 troy oz', () => {
  const eagle = findPreset('gold-eagle');
  assert.equal(eagle?.weight, 33.931);
  assert.equal(eagle?.unit, 'g');
  assert.equal(eagle?.purity, 91.67);
});

// Collection total — hand-computed.
check(
  '3x 90% quarters + 2x 14k 1g + $10 face at silver $50, gold $4,000',
  () => {
    // Quarter: $50 x 0.1808 = $9.04 each -> $27.12
    // 14k 1g: $4,000 x (0.5833 g / 31.1034768) = $75.0141 each -> $150.03
    // $10 face: $50 x 7.15 = $357.50
    // Total $534.65, dealer (95%) $507.92.
    const lines: CollectionLine[] = [
      {
        id: 'line-a',
        presetId: 'quarter-90',
        name: 'Pre-1965 Silver Quarter',
        metal: 'silver',
        weight: 0.1808,
        unit: 'oz',
        purity: 100,
        premium: 0,
        quantity: 3,
        unitValueSnapshot: 9.04,
      },
      {
        id: 'line-b',
        presetId: 'gold-14k',
        name: '14k Gold',
        metal: 'gold',
        weight: 1,
        unit: 'g',
        purity: 58.33,
        premium: 0,
        quantity: 2,
        unitValueSnapshot: 75.0141,
      },
      {
        id: 'line-c',
        presetId: 'face-10',
        name: '$10 Face Value 90% Silver',
        metal: 'silver',
        weight: 7.15,
        unit: 'oz',
        purity: 100,
        premium: 0,
        quantity: 1,
        unitValueSnapshot: 357.5,
      },
    ];
    const total = lines.reduce(
      (sum, line) => sum + lineValue(line, line.metal === 'gold' ? 4000 : 50),
      0
    );
    const dealerTotal = lines.reduce(
      (sum, line) =>
        sum + lineDealerValue(line, line.metal === 'gold' ? 4000 : 50),
      0
    );
    assert.equal(usd(total), '534.65');
    assert.equal(usd(dealerTotal), '507.92');
    // Snapshot fallback (no live price) gives the same total.
    const snapshotTotal = lines.reduce(
      (sum, line) => sum + lineValue(line, null),
      0
    );
    closeTo(snapshotTotal, 534.65, 0.01);
  }
);

check(
  'parseCollectionLines round-trips valid lines and rejects bad ones',
  () => {
    const lines: CollectionLine[] = [
      {
        id: 'line-a',
        presetId: 'silver-eagle',
        name: '1 oz Silver Eagle',
        metal: 'silver',
        weight: 1,
        unit: 'oz',
        purity: 99.9,
        premium: 0,
        quantity: 2,
        unitValueSnapshot: 41.58,
      },
    ];
    const parsed = parseCollectionLines(JSON.parse(JSON.stringify(lines)));
    assert.deepEqual(parsed, lines);
    assert.equal(parseCollectionLines([{ ...lines[0], metal: 'lead' }]), null);
    assert.equal(parseCollectionLines([{ ...lines[0], quantity: 0 }]), null);
    assert.equal(parseCollectionLines('not an array'), null);
  }
);

// Purity picker.
check('24 standard purities across 6 groups', () => {
  assert.equal(ALL_PURITY_OPTIONS.length, 24);
  assert.equal(PURITY_GROUPS.length, 6);
});

check('every preset purity has a matching picker option', () => {
  for (const preset of PRESETS) {
    if (preset.id === CUSTOM_PRESET_ID) {
      continue;
    }
    const option = findPurityOptionForMetal(preset.metal, preset.purity);
    assert.ok(
      option !== null,
      `${preset.name} (${preset.purity}%) has no picker option`
    );
  }
});

check('99.9% and 99.99% are distinct options', () => {
  assert.notEqual(
    findPurityOption(99.9)?.label,
    findPurityOption(99.99)?.label
  );
  assert.equal(findPurityOption(99.9)?.label, '.999');
  assert.equal(findPurityOption(99.99)?.label, '24k');
});

check(
  'coverage walk-through: every common holding reaches the right number',
  () => {
    // Preset path.
    assert.ok(findPreset('silver-eagle') !== null); // 1 oz Silver Eagle
    assert.ok(findPreset('gold-14k') !== null); // 14k gold chain (1 g default, adjust weight)
    assert.ok(findPreset('quarter-90') !== null); // roll of 90% quarters (qty 40)
    assert.ok(findPreset('kennedy-40') !== null); // 40% Kennedy half
    assert.ok(findPreset('gold-10k') !== null); // 10k class ring (grams)
    assert.ok(findPreset('gold-bar-1g') !== null); // 1 g gold bar
    assert.ok(findPreset('platinum-eagle') !== null); // platinum coin
    assert.ok(findPreset('war-nickel') !== null); // war nickel
    // Picker path (no preset needed): odd-weight 22k bracelet, 80% silver
    // foreign coin, sterling flatware, pre-2013 .958 Britannia, 9k jewelry.
    assert.equal(findPurityOptionForMetal('gold', 91.67)?.label, '22k');
    assert.equal(findPurityOptionForMetal('silver', 80)?.label, '.800');
    assert.equal(findPurityOptionForMetal('silver', 92.5)?.label, '.925');
    assert.equal(findPurityOptionForMetal('silver', 95.8)?.label, '.958');
    assert.equal(findPurityOptionForMetal('gold', 37.5)?.label, '9k');
    // Pure-weight convention is a picker option (100%).
    assert.equal(findPurityOption(100)?.label, '100%');
  }
);

console.log('All preset/purity/collection checks passed.');
