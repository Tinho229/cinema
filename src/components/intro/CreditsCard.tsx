import GlassCard from "./GlassCard";

function Line({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`overflow-hidden leading-relaxed ${className}`}>
      {text.split("").map((ch, i) => (
        <span key={`${text}-${i}`} className="char">
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </p>
  );
}

const rows = [
  ["Technique production", "XXX XXX"],
  ["Co-réalisation", "XXX XXX / XXX XXX"],
  ["Directeur technique", "XXX XXX"],
];

export default function CreditsCard() {
  return (
    <GlassCard className="glass-tr top-4 right-4 w-[min(82vw,300px)] p-4 md:top-8 md:right-8 md:p-6">
      <div className="space-y-3 text-[10px] md:text-xs">
        {rows.map(([label, value]) => (
          <div key={label}>
            <Line text={label} className="text-[#c8c4bc]" />
            <Line text={value} className="mt-1 font-medium" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}