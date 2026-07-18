import { PanelHeader } from '@/components/layout/PanelHeader';
import { FairPayView } from '@/components/fair-pay/FairPayView';

export default function FairPayPage() {
  return (
    <div>
      <PanelHeader moduleKey="fair_pay" />
      <div className="p-4 sm:p-5">
        <FairPayView />
      </div>
    </div>
  );
}
