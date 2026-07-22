'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AccountActions() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!configured) { setSignedIn(false); return; }
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, [configured]);

  if (!configured || signedIn === null) return null;
  if (!signedIn) return <a href="/auth" className="hidden sm:inline-flex rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[11px] font-semibold hover:border-[color:var(--yellow)]">Sign in</a>;

  return (
    <button type="button" className="hidden sm:inline-flex rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[11px] font-semibold hover:border-[color:var(--yellow)]" onClick={async () => { await createClient().auth.signOut(); router.replace('/'); router.refresh(); }}>
      Sign out
    </button>
  );
}
