import { PanelHeader } from '@/components/layout/PanelHeader';
import { Callout } from '@/components/common/Callout';

/**
 * Placeholder for modules whose interactive view isn't yet built out.
 * Shows the PanelHeader (badge, title, purpose, SDG chips) so the module
 * feels present, and a callout describing what's coming.
 */
export function ModulePlaceholder({
  moduleKey,
  wiringNote,
}: {
  moduleKey: string;
  wiringNote: string;
}) {
  return (
    <div>
      <PanelHeader moduleKey={moduleKey} />
      <div className="p-5">
        <Callout tone="teal">
          <strong>🛠 Live wiring in progress</strong>
          <p className="mt-1">{wiringNote}</p>
          <p className="mt-2 text-[10px] italic text-[color:var(--text-3)]">
            Every module in PathWiser ultimately calls the same engine — the Career Signal Loop's architectural claim. This surface is next in line.
          </p>
        </Callout>
      </div>
    </div>
  );
}
