import type { AiToolRow } from "@/lib/supabase/types";

type ToolWithRelevance = AiToolRow & {
  relevance: number;
  matchedSlugs: string[];
};

export function AiToolsToLearn({
  tools,
  totalHighExposureCapabilities,
  aiFamiliarity,
}: {
  tools: ToolWithRelevance[];
  totalHighExposureCapabilities: number;
  aiFamiliarity: "never" | "occasional" | "daily_power" | null;
}) {
  if (tools.length === 0) return null;

  const familiarityCopy =
    aiFamiliarity === "daily_power"
      ? "You already report daily AI use — these are the specific tools shifting your role's high-exposure capabilities."
      : aiFamiliarity === "occasional"
        ? "Going from occasional to daily AI use lowers your score by 5 points. These are the tools to ramp up on first."
        : "Going from rarely-or-never to daily AI use lowers your score by 9 points. Pick one of these and learn it well.";

  return (
    <section className="mt-12 border-t border-hairline pt-10">
      <p className="eyebrow mb-3">Tools shifting your role</p>
      <h2 className="font-display text-[24px] leading-tight text-ink">
        Where to ramp up next
      </h2>
      <p className="mt-2 text-[14px] text-mid-gray max-w-[600px]">
        {familiarityCopy}
      </p>

      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <li key={tool.id}>
            <a
              href={tool.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-parchment border border-hairline rounded-[var(--radius-brand-sm)] p-5 hover:border-cobalt transition-colors h-full"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-[20px] leading-tight text-ink group-hover:text-cobalt transition-colors">
                    {tool.name}
                  </h3>
                  {tool.vendor && (
                    <p className="mt-0.5 text-[12px] uppercase tracking-[0.08em] text-mid-gray">
                      {tool.vendor}
                    </p>
                  )}
                </div>
                <span className="font-mono text-[11px] text-mid-gray whitespace-nowrap mt-1">
                  covers {tool.relevance}/{totalHighExposureCapabilities}
                </span>
              </div>
              {tool.description && (
                <p className="mt-3 text-[13px] text-dark-gray leading-[1.55]">
                  {tool.description}
                </p>
              )}
              {tool.matchedSlugs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tool.matchedSlugs.map((slug) => (
                    <span
                      key={slug}
                      className="text-[10px] uppercase tracking-[0.06em] px-1.5 py-[3px] bg-cobalt-pale text-cobalt rounded-[2px]"
                    >
                      {slug.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
