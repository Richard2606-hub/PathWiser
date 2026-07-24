'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ClosableOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // What to do when user clicks backdrop or presses ESC when there's unsaved progress
  onEscape?: () => void;
  // If true, backdrop click closes. If false, only explicit close does.
  closeOnBackdrop?: boolean;
  // If true, ESC closes. If false, must use explicit close.
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  // aria-label / role
  ariaLabel?: string;
  role?: 'dialog' | 'alertdialog';
}

/**
 * Universal closable-overlay pattern. Solves the v1 static prototype's
 * "trapped in onboarding" problem — every overlay MUST have:
 *   1. Explicit close (×) button
 *   2. ESC key handler
 *   3. Backdrop click (with optional confirmation)
 *   4. Focus trap while open
 *   5. Restore focus on close
 *
 * Consumers just pass `open` + `onClose` and get all four behaviors for free.
 */
export function ClosableOverlay({
  open,
  onClose,
  onEscape,
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  className,
  contentClassName,
  ariaLabel = 'Dialog',
  role = 'dialog',
}: ClosableOverlayProps) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Focus trap + restore
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) || null;
    const container = containerRef.current;
    // Focus first focusable element in container after mount
    setTimeout(() => {
      const focusable = container?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 30);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        if (onEscape) onEscape();
        else onClose();
      }
      // Tab focus trap
      if (e.key === 'Tab') {
        const container = containerRef.current;
        if (!container) return;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open, closeOnEscape, onClose, onEscape]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        className
      )}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        // Only close if the mousedown started on the backdrop (not on the modal itself)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          'relative w-full max-w-2xl max-h-[92vh] overflow-y-auto',
          'bg-[color:var(--bg-elevated)] border border-[color:var(--border-strong)] rounded-2xl',
          'shadow-2xl',
          contentClassName
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface CloseButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}
/** Standard × close button. Always visible in the corner of overlays. */
export function CloseButton({ onClick, label = 'Close', className }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-2.5 right-2.5 h-11 w-11 rounded-full',
        'flex items-center justify-center text-lg font-mono',
        'text-[color:var(--text-3)] hover:text-[color:var(--text-1)]',
        'hover:bg-[color:var(--bg-glass-strong)]',
        'transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] focus-visible:outline-offset-2',
        className
      )}
    >
      ×
    </button>
  );
}
