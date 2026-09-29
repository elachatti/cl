import { cn } from "@/lib/utils";

const FIELDS = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Web Development",
  "Mobile",
  "Cloud",
  "Data Science",
  "Robotics",
  "DevOps",
  "Game Development",
];

interface TicketCardProps {
  className?: string;
}

/** The product's signature element: an event ticket listing the fields covered. */
export default function TicketCard({ className }: TicketCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-ink-900 text-ink-50 shadow-2xl shadow-black/30",
        className,
      )}
    >
      <div className="p-6 sm:p-7">
        <p className="text-sm text-ink-300">Computer Science events</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Nine fields, one place</h2>
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[15px]">
          {FIELDS.map((field) => (
            <li key={field} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              <span>{field}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-dashed border-white/20" />

      <div className="bg-ink-800/70 p-6 sm:px-7">
        <p className="text-sm font-medium text-amber-400">Included with every account</p>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-200">
          An AI assistant that recommends events, builds learning roadmaps, and helps you prepare.
        </p>
      </div>
    </div>
  );
}
