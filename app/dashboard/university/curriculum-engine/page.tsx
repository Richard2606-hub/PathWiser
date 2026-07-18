import { PanelHeader } from '@/components/layout/PanelHeader';
import { CurriculumEngineView } from '@/components/curriculum-engine/CurriculumEngineView';

export default function CurriculumEnginePage() {
  return (
    <div>
      <PanelHeader moduleKey="curriculum_engine" />
      <div className="p-4 sm:p-5">
        <CurriculumEngineView />
      </div>
    </div>
  );
}
