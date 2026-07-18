import { PanelHeader } from '@/components/layout/PanelHeader';
import { OnboardingPredictorView } from '@/components/onboarding-predictor/OnboardingPredictorView';

export default function OnboardingPredictorPage() {
  return (
    <div>
      <PanelHeader moduleKey="onboarding_predictor" />
      <div className="p-4 sm:p-5">
        <OnboardingPredictorView />
      </div>
    </div>
  );
}
