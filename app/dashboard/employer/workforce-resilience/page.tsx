import { PanelHeader } from '@/components/layout/PanelHeader';
import { WorkforceResiliencePlannerView } from '@/components/final-kit/WorkforceResiliencePlannerView';

export default function WorkforceResiliencePage() {
  return (
    <div>
      <PanelHeader moduleKey="workforce_resilience" />
      <div className="p-4 sm:p-5">
        <WorkforceResiliencePlannerView />
      </div>
    </div>
  );
}
