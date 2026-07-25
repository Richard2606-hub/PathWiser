import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MODULES, modulesForPersona } from './modules';
import { MODULE_SDGS } from './sdgs';
import type { Persona } from '@/types';

const expectedAudienceModules: Record<Persona, string[]> = {
  candidate: [
    'path_navigator',
    'living_portfolio',
    'ai_coach',
    'fair_pay',
    'life_chapter_designer',
  ],
  employer: [
    'talent_matching',
    'talent_reengagement',
    'retention_signals',
    'onboarding_predictor',
    'workforce_resilience',
  ],
  university: [
    'outcome_loop',
    'live_internship_marketplace',
    'curriculum_engine',
    'readiness_profile',
    'lifelong_learning_wallet',
  ],
};

function pagePathFor(href: string) {
  return join(process.cwd(), 'app', href.replace(/^\/+/, ''), 'page.tsx');
}

describe('Final Kit audience module registry', () => {
  it('keeps exactly five implemented modules for each audience', () => {
    for (const [persona, expectedKeys] of Object.entries(expectedAudienceModules) as [Persona, string[]][]) {
      expect(modulesForPersona(persona).map((module) => module.key)).toEqual(expectedKeys);
    }
  });

  it('keeps all fifteen audience modules route-backed and SDG-aligned', () => {
    const allAudienceKeys = Object.values(expectedAudienceModules).flat();

    expect(allAudienceKeys).toHaveLength(15);
    for (const key of allAudienceKeys) {
      const moduleMeta = MODULES[key];

      expect(moduleMeta, key).toBeDefined();
      expect(moduleMeta.href, key).toMatch(/^\/dashboard\//);
      expect(existsSync(pagePathFor(moduleMeta.href)), `${moduleMeta.href} needs a page.tsx`).toBe(true);
      expect(MODULE_SDGS[key], `${key} needs at least one SDG`).toBeDefined();
      expect(MODULE_SDGS[key].length, `${key} needs at least one SDG`).toBeGreaterThan(0);
    }
  });

  it('does not publish duplicate module hrefs', () => {
    const hrefs = Object.values(MODULES).map((module) => module.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
