"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";

type User = { id: string; name: string | null; email: string; role: "super_admin" | "admin" | "qa_team" };

export function UsersTable() {
	const qc = useQueryClient();
	const { data, isLoading } = useQuery<{ data: User[] }>({
		queryKey: ["settings", "users"],
		queryFn: async () => {
			const res = await axios.get(`${API_BASE_URL}/api/settings/users`, { headers: { Authorization: `Bearer ${getToken()}` } });
			return res.data;
		},
	});

	const del = useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`${API_BASE_URL}/api/settings/users/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "users"] }),
	});

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-sm">
				<thead>
					<tr className="text-left text-slate-600">
						<th className="px-3 py-2">Name</th>
						<th className="px-3 py-2">Email</th>
						<th className="px-3 py-2">Role</th>
						<th className="px-3 py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{isLoading && (
						<tr><td className="px-3 py-3" colSpan={4}>Loading...</td></tr>
					)}
					{data?.data?.map((u) => (
						<tr key={u.id} className="border-t border-slate-100">
							<td className="px-3 py-2">{u.name || "—"}</td>
							<td className="px-3 py-2">{u.email}</td>
							<td className="px-3 py-2 capitalize">{u.role.replace("_", " ")}</td>
							<td className="px-3 py-2">
								<button className="text-slate-700 hover:underline mr-3" onClick={() => window.dispatchEvent(new CustomEvent("open-user-modal", { detail: u }))}>Edit</button>
								<button className="text-red-600 hover:underline" onClick={() => del.mutate(u.id)}>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}


