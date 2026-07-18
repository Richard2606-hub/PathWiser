import { PanelHeader } from '@/components/layout/PanelHeader';
import { CompanyDirectoryView } from '@/components/marketplace/CompanyDirectoryView';

export default function CompanyDirectoryPage() {
  return (
    <div>
      <PanelHeader moduleKey="company_directory" />
      <div className="p-4 sm:p-5">
        <CompanyDirectoryView />
      </div>
    </div>
  );
}
