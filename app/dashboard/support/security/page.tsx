import { PanelHeader } from '@/components/layout/PanelHeader';
import { SecurityView } from '@/components/support/SecurityView';

export default function SecurityPage() { return <div><PanelHeader moduleKey="security" /><div className="p-4 sm:p-5"><SecurityView /></div></div>; }
