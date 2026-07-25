import { PanelHeader } from '@/components/layout/PanelHeader';
import { LifelongLearningWalletView } from '@/components/final-kit/LifelongLearningWalletView';

export default function LifelongLearningWalletPage() {
  return (
    <div>
      <PanelHeader moduleKey="lifelong_learning_wallet" />
      <div className="p-4 sm:p-5">
        <LifelongLearningWalletView />
      </div>
    </div>
  );
}
