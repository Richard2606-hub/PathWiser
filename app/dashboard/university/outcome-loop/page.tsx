import { PanelHeader } from '@/components/layout/PanelHeader';
import { OutcomeLoopView } from '@/components/outcome-loop/OutcomeLoopView';

export default function OutcomeLoopPage() {
  return (
    <div>
      <PanelHeader moduleKey="outcome_loop" />
      <div className="p-4 sm:p-5">
        <OutcomeLoopView />
      </div>
    </div>
  );
}
