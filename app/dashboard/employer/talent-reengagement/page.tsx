import { PanelHeader } from '@/components/layout/PanelHeader';
import { TalentReEngagementView } from '@/components/final-kit/TalentReEngagementView';

export default function TalentReEngagementPage() {
  return (
    <div>
      <PanelHeader moduleKey="talent_reengagement" />
      <div className="p-4 sm:p-5">
        <TalentReEngagementView />
      </div>
    </div>
  );
}
