import { PanelHeader } from '@/components/layout/PanelHeader';
import { UserProfileView } from '@/components/engine/UserProfileView';

export default function UserProfileEnginePage() {
  return (
    <div>
      <PanelHeader moduleKey="user_profile" />
      <div className="p-4 sm:p-5">
        <UserProfileView />
      </div>
    </div>
  );
}
