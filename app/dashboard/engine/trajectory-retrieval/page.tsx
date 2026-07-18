import { PanelHeader } from '@/components/layout/PanelHeader';
import { TrajectoryRetrievalView } from '@/components/engine/TrajectoryRetrievalView';

export default function TrajectoryRetrievalPage() {
  return (
    <div>
      <PanelHeader moduleKey="trajectory_retrieval" />
      <div className="p-4 sm:p-5">
        <TrajectoryRetrievalView />
      </div>
    </div>
  );
}
