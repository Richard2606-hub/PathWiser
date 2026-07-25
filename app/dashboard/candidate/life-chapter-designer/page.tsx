import { PanelHeader } from '@/components/layout/PanelHeader';
import { LifeChapterDesignerView } from '@/components/final-kit/LifeChapterDesignerView';

export default function LifeChapterDesignerPage() {
  return (
    <div>
      <PanelHeader moduleKey="life_chapter_designer" />
      <div className="p-4 sm:p-5">
        <LifeChapterDesignerView />
      </div>
    </div>
  );
}
