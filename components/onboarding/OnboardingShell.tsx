'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { ClosableOverlay, CloseButton } from '@/components/common/ClosableOverlay';
import { Button } from '@/components/common/Button';
import { RoleSelection } from './steps/RoleSelection';
import { ProfileIntake, type ProfileFormValues } from './steps/ProfileIntake';
import { WorkAnimalQuiz } from './steps/WorkAnimalQuiz';
import { EscoNormalization } from './steps/EscoNormalization';
import { ShapeSummary } from './steps/ShapeSummary';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import type { Persona } from '@/types';
import { cn } from '@/lib/utils';

const STEP_TITLES: Record<Persona, string[]> = {
  candidate:  ['Welcome to PathWiser', 'Profile Intake', 'Your Work Animal', 'ESCO Normalization', 'Your Career Shape'],
  employer:   ['Welcome to PathWiser', 'Organization Intake', '—', 'ISIC/ESCO Normalization', 'Your Talent Demand Shape'],
  university: ['Welcome to PathWiser', 'Programme Intake', '—', 'ISCED Normalization', 'Your Curriculum Shape'],
};
const STEP_SUBS: Record<Persona, string[]> = {
  candidate:  ['Select your audience role.', 'Tell us about your career.', 'A short read on how you work best.', 'Standardizing your profile.', 'Your career profile is ready.'],
  employer:   ['Select your audience role.', 'Tell us about your hiring needs.', '—', 'Standardizing your target profile.', 'Your talent demand profile is ready.'],
  university: ['Select your audience role.', 'Tell us about your programme.', '—', 'Standardizing your curriculum.', 'Your curriculum capability profile is ready.'],
};

/**
 * Onboarding shell — the modal that opens when someone clicks "Enter the Dashboard".
 *
 * UX FIXES from v1's trap:
 *   • × button top-right (always available)
 *   • ESC key closes (with unsaved-progress confirmation if past step 0)
 *   • Backdrop click closes (same confirmation)
 *   • "← Back to hero" bottom-left after step 0
 *   • Skip Work Animal quiz path
 *   • For employer/university, fast-track from role selection directly
 */
export function OnboardingShell() {
  const router = useRouter();
  const open = useAppStore((s) => s.onboardOpen);
  const step = useAppStore((s) => s.onboardStep);
  const role = useAppStore((s) => s.onboardRole);
  const setStep = useAppStore((s) => s.setOnboardStep);
  const setRole = useAppStore((s) => s.setOnboardRole);
  const closeOnb = useAppStore((s) => s.closeOnboarding);
  const setIdentity = useAppStore((s) => s.setIdentity);
  const setShape = useAppStore((s) => s.setShape);
  const setPersona = useAppStore((s) => s.setPersona);

  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [profileValues, setProfileValues] = useState<ProfileFormValues | null>(null);

  const totalSteps = 5;
  const effectiveRole: Persona = role || 'candidate';
  const titles = STEP_TITLES[effectiveRole];
  const subs = STEP_SUBS[effectiveRole];

  const requestClose = () => {
    if (step === 0) {
      // No progress lost
      closeOnb();
      return;
    }
    setConfirmLeaveOpen(true);
  };

  const confirmLeave = () => {
    setConfirmLeaveOpen(false);
    closeOnb();
    setStep(0);
    setRole(null as unknown as Persona);
    setProfileValues(null);
  };

  const launchAsPersona = (persona: Persona, name: string) => {
    const demoKey = persona === 'candidate' ? 'aisyah' : persona === 'employer' ? 'boldrise' : 'utm';
    const demo = DEMO_PERSONAS[demoKey];
    setIdentity({ name, role: persona.charAt(0).toUpperCase() + persona.slice(1) });
    setShape({
      ...demo.shape,
      persona,
      role: profileValues?.role || demo.shape.role,
      education: profileValues?.education || demo.shape.education,
      years_experience: profileValues?.yearsExperience ?? demo.shape.years_experience,
      state: profileValues?.state || demo.shape.state,
      skills: profileValues?.skills || demo.shape.skills,
    });
    setPersona(persona);
    closeOnb();
    router.push(`/dashboard/${persona === 'candidate' ? 'candidate/path-navigator' : persona === 'employer' ? 'employer/talent-matching' : 'university/outcome-loop'}`);
  };

  const goNext = () => {
    if (step === 0) {
      // Employer + University fast-track: skip all intermediate steps
      if (role && role !== 'candidate') {
        launchAsPersona(role, role === 'employer' ? 'BoldRise Sdn Bhd' : 'Universiti Teknologi Malaysia');
        return;
      }
      setStep(1);
      return;
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    // Last step — launch
    if (effectiveRole && profileValues) {
      launchAsPersona(effectiveRole, profileValues.name || 'Aisyah binti Rahman');
    } else if (effectiveRole) {
      launchAsPersona(effectiveRole, effectiveRole === 'candidate' ? 'Aisyah binti Rahman' : effectiveRole);
    }
  };

  const goBack = () => setStep(Math.max(0, step - 1));

  return (
    <>
      <ClosableOverlay
        open={open}
        onClose={requestClose}
        onEscape={requestClose}
        ariaLabel="Onboarding"
        contentClassName="max-w-2xl p-0 flex flex-col overflow-hidden"
      >
        <CloseButton onClick={requestClose} label="Close onboarding" />

        <div className="p-6 border-b border-[color:var(--border)]">
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === step ? 'w-8 bg-[color:var(--yellow)]' :
                  i < step ? 'w-2 bg-[color:var(--teal)]' :
                  'w-2 bg-[color:var(--border-strong)]'
                )}
              />
            ))}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">{titles[step]}</h2>
          <p className="text-sm text-[color:var(--text-2)] mt-1">{subs[step]}</p>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[62vh] overflow-y-auto">
          {step === 0 && (
            <RoleSelection
              selected={role}
              onSelect={(p) => setRole(p)}
            />
          )}
          {step === 1 && (
            <ProfileIntake
              persona={effectiveRole}
              onValid={(v) => setProfileValues(v)}
              initial={profileValues}
            />
          )}
          {step === 2 && effectiveRole === 'candidate' && (
            <WorkAnimalQuiz onFinished={() => goNext()} />
          )}
          {step === 3 && (
            <EscoNormalization
              persona={effectiveRole}
              role={profileValues?.role || 'Junior Data Analyst'}
              skills={profileValues?.skills || ['SQL', 'Python']}
            />
          )}
          {step === 4 && (
            <ShapeSummary
              persona={effectiveRole}
              name={profileValues?.name}
              role={profileValues?.role}
              skills={profileValues?.skills}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 p-4 border-t border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={requestClose}>
              ← Back to hero
            </Button>
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={goBack}>
                Back
              </Button>
            )}
          </div>
          <span className="text-[10px] font-mono text-[color:var(--text-3)]">
            Step {step + 1} of {totalSteps}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={goNext}
            disabled={step === 0 && !role}
          >
            {step === totalSteps - 1
              ? 'Launch Dashboard →'
              : step === 0 && role && role !== 'candidate'
                ? 'Launch Dashboard →'
                : 'Next →'}
          </Button>
        </div>
      </ClosableOverlay>

      {/* Confirmation modal */}
      <ClosableOverlay
        open={confirmLeaveOpen}
        onClose={() => setConfirmLeaveOpen(false)}
        ariaLabel="Confirm exit"
        contentClassName="max-w-md p-6 gap-3"
      >
        <CloseButton onClick={() => setConfirmLeaveOpen(false)} />
        <div className="flex flex-col gap-3 pr-8">
          <h3 className="text-lg font-extrabold">Leave onboarding?</h3>
          <p className="text-sm text-[color:var(--text-2)]">
            Your progress in this session will be lost. You can start again from the hero any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)}>
              Stay
            </Button>
            <Button variant="primary" onClick={confirmLeave}>
              Yes, leave
            </Button>
          </div>
        </div>
      </ClosableOverlay>
    </>
  );
}
