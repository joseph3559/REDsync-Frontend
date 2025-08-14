"use client";
import { useState } from "react";

export function KeyValueForm({
	value,
	onChange,
	keyPlaceholder = "Key",
	valuePlaceholder = "Value",
}: {
	value?: Record<string, any>;
	onChange: (v: Record<string, any>) => void;
	keyPlaceholder?: string;
	valuePlaceholder?: string;
}) {
	const [rows, setRows] = useState<{ k: string; v: string }[]>(
		value ? Object.entries(value).map(([k, v]) => ({ k, v: String(v) })) : []
	);

	function push() {
		const copy = [...rows, { k: "", v: "" }];
		setRows(copy);
	}

	function commit(next: { k: string; v: string }[]) {
		setRows(next);
		const obj: Record<string, any> = {};
		next.forEach((r) => {
			if (r.k.trim()) obj[r.k] = r.v;
		});
		onChange(obj);
	}

	return (
		<div className="space-y-2">
			{rows.map((r, idx) => (
				<div key={idx} className="flex gap-2">
					<input
						className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
						placeholder={keyPlaceholder}
						value={r.k}
						onChange={(e) => {
							const next = rows.slice();
							next[idx] = { ...r, k: e.target.value };
							commit(next);
						}}
					/>
					<input
						className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
						placeholder={valuePlaceholder}
						value={r.v}
						onChange={(e) => {
							const next = rows.slice();
							next[idx] = { ...r, v: e.target.value };
							commit(next);
						}}
					/>
					<button
						onClick={() => commit(rows.filter((_, i) => i !== idx))}
						className="px-2 text-sm text-red-600"
						type="button"
					>
						Remove
					</button>
				</div>
			))}
			<button onClick={push} type="button" className="px-3 py-1.5 text-sm rounded-md border border-slate-200">
				Add Row
			</button>
		</div>
	);
}


