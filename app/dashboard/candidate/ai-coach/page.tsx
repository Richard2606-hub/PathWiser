import { PanelHeader } from '@/components/layout/PanelHeader';
import { AICoachView } from '@/components/ai-coach/AICoachView';

export default function AICoachPage() {
  return (
    <div>
      <PanelHeader moduleKey="ai_coach" />
      <div className="p-4 sm:p-5">
        <AICoachView />
      </div>
    </div>
  );
}
