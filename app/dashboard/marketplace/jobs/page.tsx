import { PanelHeader } from '@/components/layout/PanelHeader';
import { JobListingsView } from '@/components/marketplace/JobListingsView';

export default function JobListingsPage() {
  return (
    <div>
      <PanelHeader moduleKey="job_listings" />
      <div className="p-4 sm:p-5">
        <JobListingsView />
      </div>
    </div>
  );
}
