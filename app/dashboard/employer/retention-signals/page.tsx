import { PanelHeader } from '@/components/layout/PanelHeader';
import { RetentionSignalsView } from '@/components/retention/RetentionSignalsView';

export default function RetentionSignalsPage() {
  return (
    <div>
      <PanelHeader moduleKey="retention_signals" />
      <div className="p-4 sm:p-5">
        <RetentionSignalsView />
      </div>
    </div>
  );
}
