import { PanelHeader } from '@/components/layout/PanelHeader';
import { OutcomesAggregationView } from '@/components/engine/OutcomesAggregationView';

export default function OutcomesAggregationPage() {
  return (
    <div>
      <PanelHeader moduleKey="outcomes_aggregation" />
      <div className="p-4 sm:p-5">
        <OutcomesAggregationView />
      </div>
    </div>
  );
}
