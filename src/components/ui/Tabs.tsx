import { ReactNode, useState } from "react";

type Tab = { id: string; label: string; content: ReactNode };

export function Tabs({ tabs, defaultTabId }: { tabs: Tab[]; defaultTabId?: string }) {
	const initial = defaultTabId || (tabs[0]?.id ?? "");
	const [active, setActive] = useState(initial);
	return (
		<div className="w-full">
			<div className="flex gap-2 border-b border-slate-200">
				{tabs.map((t) => (
					<button
						key={t.id}
						onClick={() => setActive(t.id)}
						className={`px-3 py-2 text-sm rounded-t-md border border-b-0 ${active === t.id ? "bg-white border-slate-200" : "bg-slate-50 border-transparent hover:bg-white"}`}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="border border-slate-200 rounded-b-md p-4 bg-white shadow-sm">
				{tabs.find((t) => t.id === active)?.content}
			</div>
		</div>
	);
}


