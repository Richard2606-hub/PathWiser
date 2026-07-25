import { PanelHeader } from '@/components/layout/PanelHeader';
import { LivingPortfolioView } from '@/components/final-kit/LivingPortfolioView';

export default function LivingPortfolioPage() {
  return (
    <div>
      <PanelHeader moduleKey="living_portfolio" />
      <div className="p-4 sm:p-5">
        <LivingPortfolioView />
      </div>
    </div>
  );
}
