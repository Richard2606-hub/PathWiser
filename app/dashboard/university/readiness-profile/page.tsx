import { PanelHeader } from '@/components/layout/PanelHeader';
import { ReadinessProfileView } from '@/components/readiness-profile/ReadinessProfileView';

export default function ReadinessProfilePage() {
  return (
    <div>
      <PanelHeader moduleKey="readiness_profile" />
      <div className="p-4 sm:p-5">
        <ReadinessProfileView />
      </div>
    </div>
  );
}
