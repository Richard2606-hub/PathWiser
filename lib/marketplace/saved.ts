'use client';

export type MarketplaceItemKind = 'job' | 'company';

const STORAGE_KEY = 'pathwiser-saved-marketplace';
type StoredItems = Record<MarketplaceItemKind, string[]>;

function readDeviceItems(): StoredItems {
  if (typeof window === 'undefined') return { job: [], company: [] };
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as Partial<StoredItems>;
    return {
      job: Array.isArray(value.job) ? value.job.map(String) : [],
      company: Array.isArray(value.company) ? value.company.map(String) : [],
    };
  } catch {
    return { job: [], company: [] };
  }
}

function writeDeviceItems(items: StoredItems) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function loadSavedItems(kind: MarketplaceItemKind) {
  try {
    const response = await fetch('/api/marketplace/saved', { cache: 'no-store' });
    if (response.ok) {
      const payload = await response.json() as {
        items?: Array<{ item_kind: MarketplaceItemKind; item_key: string }>;
      };
      return {
        ids: new Set((payload.items || []).filter((item) => item.item_kind === kind).map((item) => item.item_key)),
        persistence: 'account' as const,
      };
    }
  } catch {
    // Device persistence remains available when account storage is unavailable.
  }
  return { ids: new Set(readDeviceItems()[kind]), persistence: 'device' as const };
}

export async function updateSavedItem(
  kind: MarketplaceItemKind,
  itemKey: string,
  saved: boolean,
  snapshot: Record<string, unknown>,
) {
  try {
    const response = await fetch('/api/marketplace/saved', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_kind: kind, item_key: itemKey, saved, snapshot }),
    });
    if (response.ok) return 'account' as const;
  } catch {
    // Fall through to device persistence.
  }

  const items = readDeviceItems();
  const next = new Set(items[kind]);
  if (saved) next.add(itemKey);
  else next.delete(itemKey);
  items[kind] = Array.from(next);
  writeDeviceItems(items);
  return 'device' as const;
}
