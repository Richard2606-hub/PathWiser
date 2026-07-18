'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const TONE_STYLES: Record<string, { border: string; icon: string }> = {
  info:    { border: 'var(--sky)',     icon: 'ℹ️' },
  success: { border: 'var(--emerald)', icon: '✅' },
  warn:    { border: 'var(--amber)',   icon: '⚠️' },
  error:   { border: 'var(--rose)',    icon: '❌' },
};

/**
 * Global toast — renders whatever's in the app-store `toast` slot.
 * Auto-dismisses after 4s (set by useAppStore.showToast).
 */
export function ToastLayer() {
  const toast = useAppStore((s) => s.toast);
  const clear = useAppStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    // Additional escape handling
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toast, clear]);

  if (!toast) return null;
  const style = TONE_STYLES[toast.type] || TONE_STYLES.info;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[200] max-w-sm',
        'bg-[color:var(--bg-elevated)] border border-[color:var(--border-strong)] rounded-md',
        'p-3.5 flex items-start gap-2.5 shadow-xl',
        'animate-in slide-in-from-bottom-2 fade-in duration-200'
      )}
      style={{ borderLeftColor: style.border, borderLeftWidth: 3 }}
      role="status"
      aria-live="polite"
    >
      <span className="text-lg leading-none">{style.icon}</span>
      <div className="flex-1 text-sm text-[color:var(--text-1)]">{toast.message}</div>
      <button
        onClick={clear}
        className="text-[color:var(--text-3)] hover:text-[color:var(--text-1)] transition-colors"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
