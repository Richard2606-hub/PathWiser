import { PanelHeader } from '@/components/layout/PanelHeader';
import { ArchitectureView } from '@/components/architecture/ArchitectureView';

export default function ArchitecturePage() {
  return (
    <div>
      <PanelHeader moduleKey="architecture" />
      <div className="p-4 sm:p-5">
        <ArchitectureView />
      </div>
    </div>
  );
}
