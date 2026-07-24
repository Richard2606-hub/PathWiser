'use client';

import { useEffect, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import { ClosableOverlay, CloseButton } from '@/components/common/ClosableOverlay';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store/useAppStore';

const FLOWS = [
  { type: 'trajectory_contribution', label: 'Trajectory contribution', description: 'Allow anonymised outcomes to strengthen cohorts.' },
  { type: 'employer_discovery', label: 'Employer discovery', description: 'Allow authenticated employer members to discover your capability profile.' },
  { type: 'programme_outcomes', label: 'Programme outcomes', description: 'Allow anonymised inclusion in your approved programme cohort.' },
  { type: 'research', label: 'Anonymised research', description: 'Allow reviewed, aggregate research use.' },
] as const;

const DELETE_CONFIRMATION = 'DELETE MY PATHWISER ACCOUNT';

function clearPathWiserDeviceData() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith('pathwiser-')) storage.removeItem(key);
    }
  }
}

export function SecurityView() {
  const showToast = useAppStore((state) => state.showToast);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [account, setAccount] = useState<'loading' | 'connected' | 'preview'>('loading');
  const [exportBusy, setExportBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    void fetch('/api/consent')
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => {
        if (response.status === 401) {
          setAccount('preview');
          return;
        }
        if (!response.ok) throw new Error();
        setAccount('connected');
        const active: Record<string, boolean> = {};
        body.consents.forEach((item: { consent_type: string; revoked_at: string | null }) => {
          active[item.consent_type] = !item.revoked_at;
        });
        setConsents(active);
      })
      .catch(() => setAccount('preview'));
  }, []);

  const update = async (type: string, enabled: boolean) => {
    const previous = consents[type] || false;
    setConsents((current) => ({ ...current, [type]: enabled }));
    try {
      const response = await fetch('/api/consent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, enabled }),
      });
      if (response.status === 401) {
        setConsents((current) => ({ ...current, [type]: previous }));
        showToast('Sign in to manage persistent consent.', 'warn');
        return;
      }
      if (!response.ok) throw new Error('Consent update failed.');
      showToast(enabled ? 'Consent granted. You can revoke it at any time.' : 'Consent revoked.', 'success');
    } catch (error) {
      setConsents((current) => ({ ...current, [type]: previous }));
      showToast(error instanceof Error ? error.message : 'Consent update failed.', 'error');
    }
  };

  const exportAccount = async () => {
    if (account !== 'connected') {
      showToast('Sign in to export account data.', 'warn');
      return;
    }
    setExportBusy(true);
    try {
      const response = await fetch('/api/account', { headers: { Accept: 'application/json' } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Account export failed.');
      const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `pathwiser-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast('Your account export was downloaded.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Account export failed.', 'error');
    } finally {
      setExportBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (deletePhrase !== DELETE_CONFIRMATION || account !== 'connected') return;
    setDeleteBusy(true);
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deletePhrase }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Account deletion failed.');
      clearPathWiserDeviceData();
      await createClient().auth.signOut({ scope: 'local' });
      window.location.assign('/');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Account deletion failed.', 'error');
      setDeleteBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Account session" value={account === 'connected' ? 'Authenticated' : account === 'loading' ? 'Checking…' : 'Preview'} />
        <StatBox label="Active consents" value={Object.values(consents).filter(Boolean).length.toString()} color="var(--teal)" />
        <StatBox label="Minimum cohort" value="50" color="var(--violet)" />
        <StatBox label="Consent model" value="Revocable" color="var(--sky)" />
      </StatGrid>

      <Callout tone="teal">
        <strong>Privacy controls are enforced by the data layer</strong>
        <p className="mt-1">
          Account-owned profiles use row-level security. Employer discovery requires authentication,
          employer organisation membership, discoverability, and explicit active consent. Public
          modelled trajectories contain no real identities.
        </p>
      </Callout>

      <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <h2 className="font-bold">Your consent choices</h2>
        <p className="mt-1 text-xs text-[color:var(--text-2)]">
          Nothing is enabled by default. Revocation takes effect immediately for future access.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {FLOWS.map((flow) => (
            <label
              key={flow.type}
              className="flex items-start justify-between gap-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3"
            >
              <span>
                <strong className="text-sm">{flow.label}</strong>
                <span className="mt-1 block text-xs text-[color:var(--text-2)]">{flow.description}</span>
              </span>
              <span className="flex items-center gap-2">
                <Pill variant={consents[flow.type] ? 'acquired' : 'default'}>
                  {consents[flow.type] ? 'Enabled' : 'Private'}
                </Pill>
                <input
                  type="checkbox"
                  checked={consents[flow.type] || false}
                  onChange={(event) => void update(flow.type, event.target.checked)}
                  aria-label={`${flow.label} consent`}
                />
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <h2 className="font-bold">Your account data</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[color:var(--text-2)]">
          Download a portable JSON copy of your profile, consent history, saved items, workflow
          records, feedback and activity log. Account deletion permanently removes your
          authentication identity and account-owned records.
        </p>
        {account === 'preview' && (
          <p role="status" className="mt-3 text-xs text-[color:var(--yellow)]">
            Sign in to use account export or deletion. Device-only preview data stays on this browser.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void exportAccount()} disabled={exportBusy || account === 'loading'}>
            {exportBusy ? 'Preparing export…' : 'Download my data'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (account !== 'connected') {
                showToast('Sign in to delete an account.', 'warn');
                return;
              }
              setDeleteOpen(true);
            }}
            disabled={account === 'loading'}
            className="border-red-400/50 text-red-200 hover:border-red-300"
          >
            Delete my account
          </Button>
        </div>
      </section>

      <ClosableOverlay
        open={deleteOpen}
        onClose={() => {
          if (!deleteBusy) {
            setDeleteOpen(false);
            setDeletePhrase('');
          }
        }}
        closeOnBackdrop={!deleteBusy}
        closeOnEscape={!deleteBusy}
        ariaLabel="Confirm permanent account deletion"
        role="alertdialog"
        contentClassName="max-w-lg p-6"
      >
        <CloseButton
          onClick={() => {
            setDeleteOpen(false);
            setDeletePhrase('');
          }}
          label="Cancel account deletion"
          className={deleteBusy ? 'hidden' : undefined}
        />
        <h2 className="pr-10 text-xl font-extrabold">Permanently delete this account?</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-2)]">
          This cannot be undone. Download your data first if you need a copy. Type the exact phrase
          below to confirm:
        </p>
        <code className="mt-3 block rounded-md bg-black/20 p-3 text-xs text-red-200">{DELETE_CONFIRMATION}</code>
        <label className="mt-4 flex flex-col gap-1 text-xs">
          Confirmation phrase
          <input
            value={deletePhrase}
            onChange={(event) => setDeletePhrase(event.target.value)}
            className="community-input"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleteBusy}
            onClick={() => {
              setDeleteOpen(false);
              setDeletePhrase('');
            }}
          >
            Keep my account
          </Button>
          <Button
            type="button"
            disabled={deleteBusy || deletePhrase !== DELETE_CONFIRMATION}
            onClick={() => void deleteAccount()}
            className="bg-red-500 text-white hover:bg-red-400"
          >
            {deleteBusy ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </div>
      </ClosableOverlay>
    </div>
  );
}
