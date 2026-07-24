'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (password !== confirmation) {
      setMessage('The passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated. Opening your workspace…');
      window.setTimeout(() => {
        router.replace('/dashboard');
        router.refresh();
      }, 500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password update failed. Request a new reset link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-md rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] p-6 shadow-2xl" aria-labelledby="password-title">
        <Link href="/" className="font-mono text-sm font-bold text-[color:var(--yellow)]">[ PathWiser ]</Link>
        <h1 id="password-title" className="mt-4 text-2xl font-extrabold">Choose a new password</h1>
        <p className="mt-1 text-sm text-[color:var(--text-2)]">Use at least eight characters and avoid reusing a password from another service.</p>
        <form className="mt-5 flex flex-col gap-3" onSubmit={submit}>
          <label className="flex flex-col gap-1 text-xs">
            New password
            <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="community-input" autoComplete="new-password" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Confirm new password
            <input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="community-input" autoComplete="new-password" />
          </label>
          {message && <p role="status" className="rounded-md border border-[color:var(--border)] p-2 text-xs text-[color:var(--text-2)]">{message}</p>}
          <Button type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
        </form>
        <Link href="/auth" className="mt-4 inline-block text-xs text-[color:var(--yellow)] underline underline-offset-4">Back to sign in</Link>
      </section>
    </main>
  );
}
