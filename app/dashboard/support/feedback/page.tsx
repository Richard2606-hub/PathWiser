import { PanelHeader } from '@/components/layout/PanelHeader';
import { FeedbackView } from '@/components/support/FeedbackView';

export default function FeedbackPage() {
  return (
    <div>
      <PanelHeader moduleKey="feedback" />
      <div className="p-4 sm:p-5">
        <FeedbackView />
      </div>
    </div>
  );
}
