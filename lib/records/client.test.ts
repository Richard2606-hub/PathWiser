import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadWorkspaceRecords, saveWorkspaceRecord, type WorkspaceModule } from './client';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const finalKitModules: WorkspaceModule[] = [
  'living_portfolio',
  'life_chapter_designer',
  'talent_reengagement',
  'workforce_resilience',
  'live_internship_marketplace',
  'lifelong_learning_wallet',
];

describe('workspace record device fallback', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(finalKitModules)('keeps %s usable when account records are unavailable', async (module) => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('account service unavailable')));

    const saved = await saveWorkspaceRecord({
      module,
      record_type: 'hardening-check',
      title: `${module} evidence`,
      payload: { interactive: true },
    });
    const loaded = await loadWorkspaceRecords(module);

    expect(saved.persistence).toBe('device');
    expect(saved.record.module).toBe(module);
    expect(loaded.persistence).toBe('device');
    expect(loaded.records).toHaveLength(1);
    expect(loaded.records[0]).toMatchObject({
      id: saved.record.id,
      module,
      record_type: 'hardening-check',
      title: `${module} evidence`,
      payload: { interactive: true },
      status: 'active',
    });
  });

  it('updates an existing device record instead of duplicating it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'unauthorized' }) }));

    const first = await saveWorkspaceRecord({
      id: 'record-1',
      module: 'living_portfolio',
      record_type: 'portfolio_snapshot',
      title: 'Initial portfolio',
      payload: { score: 1 },
    });
    const second = await saveWorkspaceRecord({
      id: first.record.id,
      module: 'living_portfolio',
      record_type: 'portfolio_snapshot',
      title: 'Updated portfolio',
      status: 'review_due',
      payload: { score: 2 },
    });
    const loaded = await loadWorkspaceRecords('living_portfolio');

    expect(second.persistence).toBe('device');
    expect(loaded.records).toHaveLength(1);
    expect(loaded.records[0]).toMatchObject({
      id: 'record-1',
      title: 'Updated portfolio',
      status: 'review_due',
      payload: { score: 2 },
    });
  });
});
