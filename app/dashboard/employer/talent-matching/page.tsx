import { PanelHeader } from '@/components/layout/PanelHeader';
import { TalentMatchingView } from '@/components/talent-matching/TalentMatchingView';

export default function TalentMatchingPage() {
  return (
    <div>
      <PanelHeader moduleKey="talent_matching" />
      <div className="p-4 sm:p-5">
        <TalentMatchingView />
      </div>
    </div>
  );
}
