"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";

type UserPayload = { id?: string; name?: string; email: string; password?: string; role: "super_admin" | "admin" | "qa_team" };

export function UserModal() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<UserPayload>({ email: "", role: "admin" });

	useEffect(() => {
		function onOpen(e: any) {
			const u = e.detail as any;
			if (u) setForm({ id: u.id, name: u.name ?? "", email: u.email, role: u.role });
			else setForm({ email: "", role: "admin" });
			setOpen(true);
		}
		window.addEventListener("open-user-modal", onOpen as any);
		return () => window.removeEventListener("open-user-modal", onOpen as any);
	}, []);

	const save = useMutation({
		mutationFn: async (payload: UserPayload) => {
			if (payload.id) {
				await axios.put(`${API_BASE_URL}/api/settings/users/${payload.id}`, payload, { headers: { Authorization: `Bearer ${getToken()}` } });
			} else {
				await axios.post(`${API_BASE_URL}/api/settings/users`, payload, { headers: { Authorization: `Bearer ${getToken()}` } });
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["settings", "users"] });
			setOpen(false);
		},
	});

	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
			<div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
				<h3 className="text-lg font-semibold mb-3">{form.id ? "Edit User" : "Add User"}</h3>
				<div className="space-y-3">
					<input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="Name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
					<input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
					{!form.id && (
						<input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
					)}
					<select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
						<option value="super_admin">Super Admin</option>
						<option value="admin">Admin</option>
						<option value="qa_team">QA Team</option>
					</select>
				</div>
				<div className="mt-4 flex justify-end gap-2">
					<button className="px-3 py-1.5 text-sm rounded-md border" onClick={() => setOpen(false)}>Cancel</button>
					<button className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white" onClick={() => save.mutate(form)}>
						{save.isPending ? "Saving..." : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}


