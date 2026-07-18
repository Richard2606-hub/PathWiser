import { PanelHeader } from '@/components/layout/PanelHeader';
import { PathNavigatorView } from '@/components/path-navigator/PathNavigatorView';

export default function PathNavigatorPage() {
  return (
    <div>
      <PanelHeader moduleKey="path_navigator" />
      <div className="p-4 sm:p-5">
        <PathNavigatorView />
      </div>
    </div>
  );
}
