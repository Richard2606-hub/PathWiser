import { PanelHeader } from '@/components/layout/PanelHeader';
import { AIExplanationView } from '@/components/engine/AIExplanationView';

export default function AIExplanationPage() {
  return (
    <div>
      <PanelHeader moduleKey="ai_explanation" />
      <div className="p-4 sm:p-5">
        <AIExplanationView />
      </div>
    </div>
  );
}
