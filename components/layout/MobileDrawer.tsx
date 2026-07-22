'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { CloseButton } from '@/components/common/ClosableOverlay';

/**
 * Mobile drawer wrapping the sidebar. Slides in from the left.
 * ESC closes. Tap backdrop closes. Tapping a module inside closes automatically.
 */
export function MobileDrawer() {
  const open = useAppStore((s) => s.sidebarOpen);
  const close = useAppStore((s) => s.closeSidebar);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-300',
          'opacity-100 pointer-events-auto'
        )}
        onClick={close}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[320px] max-w-[88vw] lg:hidden',
          'bg-[#0d141d] border-r border-[color:var(--border-strong)]',
          'overflow-y-auto shadow-2xl',
          'transition-transform duration-300 ease-out',
          'translate-x-0'
        )}
        aria-label="Navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)]">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[color:var(--text-2)]">
            Menu
          </span>
          <CloseButton onClick={close} label="Close menu" className="relative top-0 right-0" />
        </div>
        <Sidebar onNavigate={close} />
      </aside>
    </>
  );
}
