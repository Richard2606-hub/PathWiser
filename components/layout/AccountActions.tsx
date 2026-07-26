'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store/useAppStore';

const pill = 'hidden sm:inline-flex rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[11px] font-semibold hover:border-[color:var(--yellow)]';

export function AccountActions() {
  const router = useRouter();
  const openEditProfile = useAppStore((state) => state.openEditProfile);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!configured) { setSignedIn(false); return; }
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, [configured]);

  if (!configured || signedIn === null) return null;
  if (!signedIn) return <a href="/auth" className={pill}>Sign in</a>;

  return (
    <div className="flex items-center gap-2">
      <button type="button" className={pill} onClick={() => openEditProfile()}>
        Edit profile
      </button>
      <button type="button" className={pill} onClick={async () => { await createClient().auth.signOut(); router.replace('/'); router.refresh(); }}>
        Sign out
      </button>
    </div>
  );
}
