'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/common/Button';
import type { Persona } from '@/types';

type AuthMode = 'sign-in' | 'register' | 'forgot';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [persona, setPersona] = useState<Persona>('candidate');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
        });
        if (error) throw error;
        setMessage('Password reset instructions were sent if an account exists for that email.');
        return;
      }

      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            data: {
              display_name: displayName,
              persona,
              role_title: 'Getting started',
              ...(persona !== 'candidate' ? { organisation_name: organisationName } : {}),
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage('Check your email to confirm your account, then return to sign in.');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next?.startsWith('/dashboard') ? next : '/dashboard');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage(null);
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-md rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] p-6 shadow-2xl" aria-labelledby="auth-title">
        <Link href="/" className="font-mono text-sm font-bold text-[color:var(--yellow)]">[ PathWiser ]</Link>
        <h1 id="auth-title" className="mt-4 text-2xl font-extrabold">
          {mode === 'sign-in' ? 'Welcome back' : mode === 'register' ? 'Create your community account' : 'Reset your password'}
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-2)]">
          {mode === 'forgot'
            ? 'Enter your account email and we will send a secure reset link.'
            : 'Your profile controls the evidence shown to you. Sharing is opt-in and revocable.'}
        </p>

        <form className="mt-5 flex flex-col gap-3" onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label className="flex flex-col gap-1 text-xs">
                Display name
                <input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="community-input" autoComplete="name" />
              </label>
              <fieldset>
                <legend className="mb-1 text-xs">I am joining as</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['candidate', 'employer', 'university'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={persona === item}
                      onClick={() => setPersona(item)}
                      className={`min-h-11 rounded-md border px-2 py-2 text-xs capitalize ${persona === item ? 'border-[color:var(--yellow)] bg-[color:var(--accent-glow)]' : 'border-[color:var(--border)]'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              {persona !== 'candidate' && (
                <label className="flex flex-col gap-1 text-xs">
                  Organisation name
                  <input required value={organisationName} onChange={(event) => setOrganisationName(event.target.value)} className="community-input" autoComplete="organization" />
                </label>
              )}
            </>
          )}

          <label className="flex flex-col gap-1 text-xs">
            Email
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="community-input" autoComplete="email" />
          </label>
          {mode !== 'forgot' && (
            <label className="flex flex-col gap-1 text-xs">
              Password
              <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="community-input" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            </label>
          )}
          {message && <p role="status" className="rounded-md border border-[color:var(--border)] p-2 text-xs text-[color:var(--text-2)]">{message}</p>}
          <Button type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <button
            type="button"
            className="text-xs text-[color:var(--yellow)] underline underline-offset-4"
            onClick={() => switchMode(mode === 'sign-in' ? 'register' : 'sign-in')}
          >
            {mode === 'sign-in' ? 'New to PathWiser? Create an account' : 'Back to sign in'}
          </button>
          {mode === 'sign-in' && (
            <button
              type="button"
              className="text-xs text-[color:var(--yellow)] underline underline-offset-4"
              onClick={() => switchMode('forgot')}
            >
              Forgot password?
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
