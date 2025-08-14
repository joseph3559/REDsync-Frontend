"use client";
import { useState, useEffect } from "react";

export function JsonEditor({ value, onChange, placeholder }: { value?: any; onChange: (v: any) => void; placeholder?: string }) {
	const [text, setText] = useState<string>(value ? JSON.stringify(value, null, 2) : "");
	const [error, setError] = useState<string>("");

	useEffect(() => {
		setText(value ? JSON.stringify(value, null, 2) : "");
	}, [value]);

	function handleBlur() {
		if (!text.trim()) {
			setError("");
			onChange(undefined);
			return;
		}
		try {
			const parsed = JSON.parse(text);
			setError("");
			onChange(parsed);
		} catch (e: any) {
			setError(e.message || "Invalid JSON");
		}
	}

	return (
		<div className="space-y-1">
			<textarea
				className="w-full min-h-40 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
				value={text}
				onChange={(e) => setText(e.target.value)}
				onBlur={handleBlur}
				placeholder={placeholder || "{\n  \"key\": \"value\"\n}"}
			/>
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}


