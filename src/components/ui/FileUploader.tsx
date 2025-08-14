"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export function FileUploader({ onFiles, accept, multiple = false, previewUrl }: { onFiles: (files: File[]) => void; accept?: Record<string, string[]>; multiple?: boolean; previewUrl?: string | null }) {
	const [hover, setHover] = useState(false);
	const onDrop = useCallback((acceptedFiles: File[]) => {
		onFiles(acceptedFiles);
	}, [onFiles]);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple });

	return (
		<div
			{...getRootProps()}
			className={`rounded-md border-2 border-dashed px-4 py-6 text-center ${isDragActive || hover ? "border-slate-400 bg-slate-50" : "border-slate-300"}`}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<input {...getInputProps()} />
			<p className="text-sm text-slate-600">Drag & drop files here, or click to select</p>
			{previewUrl && (
				<div className="mt-3 flex justify-center">
					<img src={previewUrl} alt="preview" className="h-16 w-16 object-contain rounded" />
				</div>
			)}
		</div>
	);
}


