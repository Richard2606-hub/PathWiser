'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserShape, WorkAnimalKey, Persona, LifeStage } from '@/types';

interface WorkAnimalResult {
  key: WorkAnimalKey;
  scores: Record<WorkAnimalKey, number>;
  secondary?: WorkAnimalKey;
}

interface AppState {
  // Persona + judge mode
  persona: Persona;
  judgeMode: boolean;
  setPersona: (p: Persona) => void;
  setJudgeMode: (b: boolean) => void;
  toggleJudgeMode: () => void;

  // Identity + shape
  identity: { name: string; role: string };
  setIdentity: (i: { name: string; role: string }) => void;
  shape: UserShape | null;
  setShape: (s: UserShape) => void;
  updateShapeSlider: (key: string, value: number) => void;

  // Onboarding
  onboardStep: number;
  onboardRole: Persona | null;
  onboardOpen: boolean;
  setOnboardStep: (n: number) => void;
  setOnboardRole: (p: Persona) => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  resetOnboarding: () => void;

  // Work Animal
  workAnimal: WorkAnimalResult | null;
  setWorkAnimal: (r: WorkAnimalResult | null) => void;

  // Sidebar drawer (mobile)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // Active module
  activeModule: string;
  setActiveModule: (m: string) => void;

  // Compare Paths (Career Path Navigator)
  compareMode: boolean;
  compareNodes: string[];
  toggleCompareMode: () => void;
  addCompareNode: (id: string) => void;
  removeCompareNode: (id: string) => void;
  clearCompareNodes: () => void;

  // Locked-mode explainer
  lockedExplainerOpen: boolean;
  lockedExplainerTarget: Persona | null;
  openLockedExplainer: (p: Persona | null) => void;
  closeLockedExplainer: () => void;

  // Toast
  toast: { message: string; type: 'info' | 'success' | 'warn' | 'error' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  clearToast: () => void;
}

const DEFAULT_SHAPE_SLIDERS = {
  technical: 65,
  domain: 50,
  leadership: 30,
  analytics: 75,
  communication: 45,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      persona: 'candidate',
      judgeMode: false,
      setPersona: (persona) => set({ persona }),
      setJudgeMode: (judgeMode) => set({ judgeMode }),
      toggleJudgeMode: () => set((s) => ({ judgeMode: !s.judgeMode })),

      identity: { name: 'You', role: 'Candidate' },
      setIdentity: (identity) => set({ identity }),
      shape: null,
      setShape: (shape) => set({ shape }),
      updateShapeSlider: (key, value) =>
        set((s) => {
          const cur = s.shape;
          if (!cur) return {};
          return {
            shape: {
              ...cur,
              // Store slider adjustments in a virtual field so retrieval can factor them in
              // We keep the original UserShape typing clean; slider values live on the
              // dashboard-local UI, not on the persisted shape.
            },
          };
        }),

      onboardStep: 0,
      onboardRole: null,
      onboardOpen: false,
      setOnboardStep: (onboardStep) => set({ onboardStep }),
      setOnboardRole: (onboardRole) => set({ onboardRole }),
      openOnboarding: () => set({ onboardOpen: true, onboardStep: 0 }),
      closeOnboarding: () => set({ onboardOpen: false }),
      resetOnboarding: () =>
        set({ onboardOpen: false, onboardStep: 0, onboardRole: null }),

      workAnimal: null,
      setWorkAnimal: (workAnimal) => set({ workAnimal }),

      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),

      activeModule: 'path_navigator',
      setActiveModule: (activeModule) => set({ activeModule }),

      compareMode: false,
      compareNodes: [],
      toggleCompareMode: () =>
        set((s) => {
          if (s.compareMode) return { compareMode: false, compareNodes: [] };
          return { compareMode: true };
        }),
      addCompareNode: (id) =>
        set((s) => {
          if (s.compareNodes.includes(id)) return {};
          if (s.compareNodes.length >= 3) {
            return { compareNodes: [...s.compareNodes.slice(1), id] };
          }
          return { compareNodes: [...s.compareNodes, id] };
        }),
      removeCompareNode: (id) =>
        set((s) => ({ compareNodes: s.compareNodes.filter((n) => n !== id) })),
      clearCompareNodes: () => set({ compareNodes: [] }),

      lockedExplainerOpen: false,
      lockedExplainerTarget: null,
      openLockedExplainer: (p) =>
        set({ lockedExplainerOpen: true, lockedExplainerTarget: p }),
      closeLockedExplainer: () =>
        set({ lockedExplainerOpen: false, lockedExplainerTarget: null }),

      toast: null,
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } });
        setTimeout(() => {
          const cur = get().toast;
          if (cur?.message === message) set({ toast: null });
        }, 4000);
      },
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'pathwiser-app',
      partialize: (s) => ({
        persona: s.persona,
        identity: s.identity,
        shape: s.shape,
        workAnimal: s.workAnimal,
        judgeMode: s.judgeMode,
      }),
    }
  )
);

export { DEFAULT_SHAPE_SLIDERS };
