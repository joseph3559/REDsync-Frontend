"use client";
import { useState } from "react";

export function TagInput({ value, onChange, placeholder = "Add item and press Enter" }: { value?: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
	const [input, setInput] = useState("");
	const tags = value || [];

	function add(tag: string) {
		const t = tag.trim();
		if (!t) return;
		const next = Array.from(new Set([...(value || []), t]));
		onChange(next);
		setInput("");
	}

	function remove(idx: number) {
		const next = (value || []).filter((_, i) => i !== idx);
		onChange(next);
	}

	return (
		<div className="rounded-md border border-slate-200 bg-white px-2 py-1">
			<div className="flex flex-wrap gap-1">
				{tags.map((t, i) => (
					<span key={i} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs">
						{t}
						<button type="button" className="text-slate-500" onClick={() => remove(i)} aria-label="Remove">
							×
						</button>
					</span>
				))}
				<input
					className="flex-1 min-w-32 px-2 py-1 text-sm outline-none"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							add(input);
						}
					}}
					placeholder={placeholder}
				/>
			</div>
		</div>
	);
}


