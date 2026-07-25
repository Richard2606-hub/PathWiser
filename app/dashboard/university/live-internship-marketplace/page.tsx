import { PanelHeader } from '@/components/layout/PanelHeader';
import { LiveInternshipMarketplaceView } from '@/components/final-kit/LiveInternshipMarketplaceView';

export default function LiveInternshipMarketplacePage() {
  return (
    <div>
      <PanelHeader moduleKey="live_internship_marketplace" />
      <div className="p-4 sm:p-5">
        <LiveInternshipMarketplaceView />
      </div>
    </div>
  );
}
