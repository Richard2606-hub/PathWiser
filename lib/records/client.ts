export type WorkspaceModule =
  | 'retention_signals'
  | 'onboarding_predictor'
  | 'outcome_loop'
  | 'curriculum_engine'
  | 'readiness_profile';

export type WorkspaceRecordStatus = 'draft' | 'active' | 'review_due' | 'completed' | 'archived';

export interface WorkspaceRecord<TPayload extends object = Record<string, unknown>> {
  id: string;
  module: WorkspaceModule;
  record_type: string;
  title: string;
  status: WorkspaceRecordStatus;
  payload: TPayload;
  next_review_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveWorkspaceRecord<TPayload extends object> {
  id?: string;
  module: WorkspaceModule;
  record_type: string;
  title: string;
  status?: WorkspaceRecordStatus;
  payload: TPayload;
  next_review_at?: string | null;
}

function storageKey(module: WorkspaceModule) {
  return `pathwiser-workspace-${module}`;
}

function readLocal<TPayload extends object>(module: WorkspaceModule) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(module)) || '[]') as WorkspaceRecord<TPayload>[];
  } catch {
    return [];
  }
}

function writeLocal<TPayload extends object>(
  module: WorkspaceModule,
  records: WorkspaceRecord<TPayload>[],
) {
  localStorage.setItem(storageKey(module), JSON.stringify(records.slice(0, 100)));
}

export async function loadWorkspaceRecords<TPayload extends object>(
  module: WorkspaceModule,
): Promise<{ records: WorkspaceRecord<TPayload>[]; persistence: 'account' | 'device' }> {
  try {
    const response = await fetch(`/api/records?module=${encodeURIComponent(module)}`);
    const body = await response.json();
    if (response.ok) return { records: body.records || [], persistence: 'account' };
  } catch {
    // Fall back to device-local continuity when account services are unavailable.
  }
  return { records: readLocal<TPayload>(module), persistence: 'device' };
}

export async function saveWorkspaceRecord<TPayload extends object>(
  input: SaveWorkspaceRecord<TPayload>,
): Promise<{ record: WorkspaceRecord<TPayload>; persistence: 'account' | 'device' }> {
  try {
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await response.json();
    if (response.ok) return { record: body.record, persistence: 'account' };
  } catch {
    // Fall through to device-local storage.
  }

  const now = new Date().toISOString();
  const localRecord: WorkspaceRecord<TPayload> = {
    id: input.id || crypto.randomUUID(),
    module: input.module,
    record_type: input.record_type,
    title: input.title,
    status: input.status || 'active',
    payload: input.payload,
    next_review_at: input.next_review_at || null,
    created_at: now,
    updated_at: now,
  };
  const current = readLocal<TPayload>(input.module);
  const next = [localRecord, ...current.filter((record) => record.id !== localRecord.id)];
  writeLocal(input.module, next);
  return { record: localRecord, persistence: 'device' };
}
