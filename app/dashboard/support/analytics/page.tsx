import { PanelHeader } from '@/components/layout/PanelHeader';
import { AnalyticsView } from '@/components/support/AnalyticsView';

export default function AnalyticsPage() { return <div><PanelHeader moduleKey="analytics" /><div className="p-4 sm:p-5"><AnalyticsView /></div></div>; }
