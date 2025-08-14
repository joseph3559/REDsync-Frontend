"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { FileUploader } from "@/components/ui/FileUploader";
import { JsonEditor } from "@/components/ui/JsonEditor";
import { KeyValueForm } from "@/components/ui/KeyValueForm";
import { TagInput } from "@/components/ui/TagInput";
import { UsersTable } from "@/components/settings/UsersTable";
import { UserModal } from "@/components/settings/UserModal";
import { Toaster, toast } from "sonner";
import ApiKeyDialog, { API_PROVIDERS } from "@/components/settings/ApiKeyDialog";

const qc = new QueryClient();

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-lg border border-slate-200 bg-white shadow-sm">
			<div className="px-4 py-3 border-b border-slate-100">
				<h3 className="font-medium text-slate-900">{title}</h3>
			</div>
			<div className="p-4 space-y-4">{children}</div>
		</div>
	);
}

function CompanyInfoTab() {
	const { data, isLoading, refetch } = useQuery<{ data: any }>({
		queryKey: ["settings", "company"],
		queryFn: async () => (await axios.get(`${API_BASE_URL}/api/settings/company`, { headers: { Authorization: `Bearer ${getToken()}` } })).data,
	});
	const [logo, setLogo] = useState<File | null>(null);
	const [form, setForm] = useState<any>({});
	useEffect(() => { if (data?.data) setForm(data.data); }, [data]);
	const save = useMutation({
		mutationFn: async () => {
			const fd = new FormData();
			Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? "")));
			if (logo) fd.append("logo", logo);
			return (await axios.post(`${API_BASE_URL}/api/settings/company`, fd, { headers: { Authorization: `Bearer ${getToken()}` } })).data;
		},
		onSuccess: () => { toast.success("Company information saved successfully"); refetch(); },
		onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to save company information"),
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[...Array(8)].map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-4 bg-slate-200 rounded w-1/3"></div>
								<div className="h-10 bg-slate-200 rounded"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
						<span className="text-2xl">🏢</span>
					</div>
					<div>
						<h2 className="text-xl font-semibold text-slate-900">Company Information</h2>
						<p className="text-slate-600 mt-1">Manage your organization's basic details and branding</p>
					</div>
				</div>
			</div>

			<SectionCard title="Company Details">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Company Name <span className="text-red-500">*</span>
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="Enter company name" 
							value={form.companyName || ""} 
							onChange={(e) => setForm({ ...form, companyName: e.target.value })} 
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Contact Person <span className="text-red-500">*</span>
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="Primary contact name" 
							value={form.contactPerson || ""} 
							onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} 
						/>
					</div>

					<div className="space-y-2 md:col-span-2">
						<label className="block text-sm font-medium text-slate-700">
							Street Address
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="Street address, building number" 
							value={form.address || ""} 
							onChange={(e) => setForm({ ...form, address: e.target.value })} 
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Postal Code
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="Postal/ZIP code" 
							value={form.postalCode || ""} 
							onChange={(e) => setForm({ ...form, postalCode: e.target.value })} 
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							City
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="City name" 
							value={form.city || ""} 
							onChange={(e) => setForm({ ...form, city: e.target.value })} 
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Country
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="Country name" 
							value={form.country || ""} 
							onChange={(e) => setForm({ ...form, country: e.target.value })} 
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Email Address <span className="text-red-500">*</span>
						</label>
						<input 
							type="email"
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="contact@company.com" 
							value={form.email || ""} 
							onChange={(e) => setForm({ ...form, email: e.target.value })} 
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Phone Number
						</label>
						<input 
							type="tel"
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
							placeholder="+1 (555) 123-4567" 
							value={form.phone || ""} 
							onChange={(e) => setForm({ ...form, phone: e.target.value })} 
						/>
					</div>
				</div>
			</SectionCard>

			<SectionCard title="Company Logo">
				<div className="space-y-4">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Logo Image
						</label>
						<p className="text-sm text-slate-500">
							Upload your company logo. Recommended size: 400x400px, max 2MB. Supports PNG, JPG, and SVG formats.
						</p>
					</div>
					<FileUploader 
						onFiles={(files) => setLogo(files[0])} 
						accept={{ "image/*": [".png", ".jpg", ".jpeg", ".svg"] }} 
						multiple={false} 
						previewUrl={data?.data?.logoPath ? `${API_BASE_URL}${data.data.logoPath}` : undefined} 
					/>
					{data?.data?.logoPath && (
						<div className="bg-slate-50 rounded-lg p-4">
							<p className="text-sm text-slate-600 mb-2">Current logo:</p>
							<img 
								src={`${API_BASE_URL}${data.data.logoPath}`} 
								alt="Company logo" 
								className="h-20 w-20 object-contain rounded-lg border border-slate-200"
							/>
						</div>
					)}
				</div>
			</SectionCard>

			<div className="flex justify-end pt-6 border-t border-slate-200">
				<button 
					className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2" 
					onClick={() => save.mutate()}
					disabled={save.isPending}
				>
					{save.isPending ? (
						<>
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Saving...
						</>
					) : (
						<>
							<span>💾</span>
							Save Company Information
						</>
					)}
				</button>
			</div>
		</div>
	);
}

function UsersTab() {
	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
						<span className="text-2xl">👥</span>
					</div>
					<div>
						<h2 className="text-xl font-semibold text-slate-900">User & Role Management</h2>
						<p className="text-slate-600 mt-1">Manage team members and their access permissions</p>
					</div>
				</div>
			</div>

			{/* Actions Bar */}
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
					<p className="text-sm text-slate-600">Manage user accounts and permissions</p>
				</div>
				<button 
					className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2" 
					onClick={() => window.dispatchEvent(new CustomEvent("open-user-modal"))}
				>
					<span>➕</span>
					Add New User
				</button>
			</div>

			{/* Users Table */}
			<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
			<UsersTable />
			</div>

			{/* User Modal */}
			<UserModal />
		</div>
	);
}

function CoaTab() {
	const { data, isLoading } = useQuery<{ data: any }>({ queryKey: ["settings", "coa"], queryFn: async () => (await axios.get(`${API_BASE_URL}/api/settings/coa`, { headers: { Authorization: `Bearer ${getToken()}` } })).data });
	const [form, setForm] = useState<any>({ defaultColumnMapping: {}, extractionRules: {}, fileProcessingLimits: { maxSizeMB: 50, allowedFormats: ['pdf', 'xlsx', 'csv'] } });
	const [newMappingKey, setNewMappingKey] = useState("");
	const [newMappingValue, setNewMappingValue] = useState("");
	const [newRuleKey, setNewRuleKey] = useState("");
	const [newRuleValue, setNewRuleValue] = useState("");

	useEffect(() => setForm({ ...form, ...(data?.data || {}) }), [data]);
	
	const save = useMutation({
		mutationFn: async () => (await axios.post(`${API_BASE_URL}/api/settings/coa`, form, { headers: { Authorization: `Bearer ${getToken()}` } })).data,
		onSuccess: () => toast.success("COA processing settings saved successfully"),
		onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to save COA settings"),
	});

	const addColumnMapping = () => {
		if (newMappingKey && newMappingValue) {
			setForm({
				...form,
				defaultColumnMapping: {
					...(form.defaultColumnMapping || {}),
					[newMappingKey]: newMappingValue
				}
			});
			setNewMappingKey("");
			setNewMappingValue("");
		}
	};

	const removeColumnMapping = (key: string) => {
		const newMapping = { ...(form.defaultColumnMapping || {}) };
		delete newMapping[key];
		setForm({ ...form, defaultColumnMapping: newMapping });
	};

	const addExtractionRule = () => {
		if (newRuleKey && newRuleValue) {
			setForm({
				...form,
				extractionRules: {
					...(form.extractionRules || {}),
					[newRuleKey]: newRuleValue
				}
			});
			setNewRuleKey("");
			setNewRuleValue("");
		}
	};

	const removeExtractionRule = (key: string) => {
		const newRules = { ...(form.extractionRules || {}) };
		delete newRules[key];
		setForm({ ...form, extractionRules: newRules });
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
					{[...Array(3)].map((_, i) => (
						<div key={i} className="space-y-3 mb-6">
							<div className="h-6 bg-slate-200 rounded w-1/3"></div>
							<div className="h-32 bg-slate-200 rounded"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
						<span className="text-2xl">📄</span>
					</div>
					<div>
						<h2 className="text-xl font-semibold text-slate-900">COA Processing Configuration</h2>
						<p className="text-slate-600 mt-1">Configure column mappings and extraction rules for Certificate of Analysis processing</p>
					</div>
				</div>
			</div>

			{/* Default Column Mapping */}
			<SectionCard title="Default Column Mapping">
				<div className="space-y-4">
					<p className="text-sm text-slate-600">
						Map Excel/CSV column headers to standardized field names for consistent data extraction.
					</p>
					
					{/* Add New Mapping */}
					<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
						<h4 className="font-medium text-slate-900 mb-3">Add Column Mapping</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Source Column</label>
								<input
									className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="e.g., Product Name"
									value={newMappingKey}
									onChange={(e) => setNewMappingKey(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Target Field</label>
								<input
									className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="e.g., product_name"
									value={newMappingValue}
									onChange={(e) => setNewMappingValue(e.target.value)}
								/>
							</div>
							<div className="flex items-end">
								<button
									onClick={addColumnMapping}
									className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
								>
									Add Mapping
								</button>
							</div>
						</div>
					</div>

					{/* Existing Mappings */}
					<div className="space-y-2">
						{Object.entries(form.defaultColumnMapping || {}).map(([key, value]) => (
							<div key={key} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
								<div className="flex items-center gap-4">
									<span className="font-medium text-slate-900">{key}</span>
									<span className="text-slate-500">→</span>
									<span className="text-slate-600">{String(value)}</span>
								</div>
								<button
									onClick={() => removeColumnMapping(key)}
									className="text-red-600 hover:text-red-700 text-sm"
								>
									Remove
								</button>
							</div>
						))}
						{Object.keys(form.defaultColumnMapping || {}).length === 0 && (
							<p className="text-slate-500 text-center py-4">No column mappings configured</p>
						)}
					</div>
				</div>
			</SectionCard>

			{/* Extraction Rules */}
			<SectionCard title="Extraction Rules">
				<div className="space-y-4">
					<p className="text-sm text-slate-600">
						Define rules for extracting specific data patterns from COA documents.
					</p>
					
					{/* Add New Rule */}
					<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
						<h4 className="font-medium text-slate-900 mb-3">Add Extraction Rule</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Field Name</label>
								<input
									className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="e.g., batch_number"
									value={newRuleKey}
									onChange={(e) => setNewRuleKey(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Extraction Pattern</label>
								<input
									className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="e.g., Batch: ([A-Z0-9]+)"
									value={newRuleValue}
									onChange={(e) => setNewRuleValue(e.target.value)}
								/>
							</div>
							<div className="flex items-end">
								<button
									onClick={addExtractionRule}
									className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
								>
									Add Rule
								</button>
							</div>
						</div>
					</div>

					{/* Existing Rules */}
					<div className="space-y-2">
						{Object.entries(form.extractionRules || {}).map(([key, value]) => (
							<div key={key} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
								<div className="flex items-center gap-4">
									<span className="font-medium text-slate-900">{key}</span>
									<span className="text-slate-500">→</span>
									<code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">{String(value)}</code>
								</div>
								<button
									onClick={() => removeExtractionRule(key)}
									className="text-red-600 hover:text-red-700 text-sm"
								>
									Remove
								</button>
							</div>
						))}
						{Object.keys(form.extractionRules || {}).length === 0 && (
							<p className="text-slate-500 text-center py-4">No extraction rules configured</p>
						)}
					</div>
				</div>
			</SectionCard>

			{/* File Processing Limits */}
			<SectionCard title="File Processing Limits">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Maximum File Size (MB)
						</label>
						<input 
							className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
							type="number" 
							placeholder="50" 
							value={form.fileProcessingLimits?.maxSizeMB || ""} 
							onChange={(e) => setForm({ 
								...form, 
								fileProcessingLimits: { 
									...(form.fileProcessingLimits || {}), 
									maxSizeMB: Number(e.target.value) 
								} 
							})} 
						/>
						<p className="text-xs text-slate-500">Maximum size for uploaded COA files</p>
					</div>
					
					<div className="space-y-2">
						<label className="block text-sm font-medium text-slate-700">
							Allowed File Formats
						</label>
						<TagInput 
							value={form.fileProcessingLimits?.allowedFormats || []} 
							onChange={(v) => setForm({ 
								...form, 
								fileProcessingLimits: { 
									...(form.fileProcessingLimits || {}), 
									allowedFormats: v 
								} 
							})} 
						/>
						<p className="text-xs text-slate-500">Supported file formats for COA processing</p>
					</div>
				</div>
			</SectionCard>

			<div className="flex justify-end pt-6 border-t border-slate-200">
				<button 
					className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2" 
					onClick={() => save.mutate()}
					disabled={save.isPending}
				>
					{save.isPending ? (
						<>
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Saving...
						</>
					) : (
						<>
							<span>💾</span>
							Save COA Settings
						</>
					)}
				</button>
			</div>
		</div>
	);
}

function ImportExportTab() {
	const { data } = useQuery<{ data: any }>({ queryKey: ["settings", "ie"], queryFn: async () => (await axios.get(`${API_BASE_URL}/api/settings/import-export`, { headers: { Authorization: `Bearer ${getToken()}` } })).data });
	const [form, setForm] = useState<any>({});
	useEffect(() => setForm(data?.data || {}), [data]);
	const save = useMutation({
		mutationFn: async () => (await axios.post(`${API_BASE_URL}/api/settings/import-export`, form, { headers: { Authorization: `Bearer ${getToken()}` } })).data,
		onSuccess: () => toast.success("Saved Import/Export settings"),
		onError: (e: any) => toast.error(e?.response?.data?.message || "Save failed"),
	});
	return (
		<div className="space-y-4">
			<SectionCard title="HS Codes">
				<TagInput value={form.hsCodes || []} onChange={(v) => setForm({ ...form, hsCodes: v })} />
			</SectionCard>
			<SectionCard title="Competitor Mapping">
				<KeyValueForm value={form.competitorMapping} onChange={(v) => setForm({ ...form, competitorMapping: v })} />
			</SectionCard>
			<SectionCard title="Currency Preferences">
				<JsonEditor value={form.currencyPreferences} onChange={(v) => setForm({ ...form, currencyPreferences: v })} />
			</SectionCard>
			<SectionCard title="Filter Presets">
				<JsonEditor value={form.filterPresets} onChange={(v) => setForm({ ...form, filterPresets: v })} />
			</SectionCard>
			<div className="flex justify-end"><button className="px-4 py-2 rounded-md bg-slate-900 text-white" onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save"}</button></div>
		</div>
	);
}

function QuestionnaireTab() {
	const { data } = useQuery<{ data: any }>({ queryKey: ["settings", "q"], queryFn: async () => (await axios.get(`${API_BASE_URL}/api/settings/questionnaires`, { headers: { Authorization: `Bearer ${getToken()}` } })).data });
	const [form, setForm] = useState<any>({ predefinedAnswers: {}, skipLogicRules: {} });
	const [files, setFiles] = useState<File[]>([]);
	useEffect(() => setForm(data?.data || { predefinedAnswers: {}, skipLogicRules: {} }), [data]);
	const save = useMutation({
		mutationFn: async () => {
			const fd = new FormData();
			fd.append("predefinedAnswers", JSON.stringify(form.predefinedAnswers || {}));
			fd.append("skipLogicRules", JSON.stringify(form.skipLogicRules || {}));
			files.forEach((f) => fd.append("certifications", f));
			return (await axios.post(`${API_BASE_URL}/api/settings/questionnaires`, fd, { headers: { Authorization: `Bearer ${getToken()}` } })).data;
		},
		onSuccess: () => toast.success("Saved questionnaire settings"),
		onError: (e: any) => toast.error(e?.response?.data?.message || "Save failed"),
	});
	return (
		<div className="space-y-4">
			<SectionCard title="Predefined Answers">
				<KeyValueForm value={form.predefinedAnswers} onChange={(v) => setForm({ ...form, predefinedAnswers: v })} keyPlaceholder="Question" valuePlaceholder="Answer" />
			</SectionCard>
			<SectionCard title="Skip Logic Rules">
				<KeyValueForm value={form.skipLogicRules} onChange={(v) => setForm({ ...form, skipLogicRules: v })} />
			</SectionCard>
			<SectionCard title="Certifications">
				<FileUploader onFiles={setFiles} accept={{ "application/pdf": [".pdf"] }} multiple={true} />
				{Array.isArray(data?.data?.certifications) && data!.data!.certifications!.length > 0 && (
					<ul className="mt-2 text-sm text-slate-600 list-disc ml-5">
						{(data!.data!.certifications as string[]).map((p: string, idx: number) => (
							<li key={idx}><a href={`${API_BASE_URL}${p}`} className="hover:underline" target="_blank">{p.split("/").pop()}</a></li>
						))}
					</ul>
				)}
			</SectionCard>
			<div className="flex justify-end"><button className="px-4 py-2 rounded-md bg-slate-900 text-white" onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save"}</button></div>
		</div>
	);
}

function AiTab() {
	const { data, refetch } = useQuery<{ data: any }>({ queryKey: ["settings", "ai"], queryFn: async () => (await axios.get(`${API_BASE_URL}/api/settings/ai`, { headers: { Authorization: `Bearer ${getToken()}` } })).data });
	const [form, setForm] = useState<any>({ model: "gpt-4o", confidenceThreshold: 0.5, apiKeys: {} });
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<any>(null);

	useEffect(() => setForm({ ...form, ...(data?.data || {}) }), [data]);

	const save = useMutation({
		mutationFn: async () => (await axios.post(`${API_BASE_URL}/api/settings/ai`, form, { headers: { Authorization: `Bearer ${getToken()}` } })).data,
		onSuccess: () => {
			toast.success("Saved AI settings");
			refetch();
		},
		onError: (e: any) => toast.error(e?.response?.data?.message || "Save failed"),
	});

	const handleSaveApiKey = (provider: string, key: string, model?: string) => {
		const updatedApiKeys = { ...(form.apiKeys || {}), [provider]: key };
		const updatedForm = { ...form, apiKeys: updatedApiKeys };
		
		if (model) {
			updatedForm.model = model;
		}
		
		setForm(updatedForm);
		save.mutate(updatedForm);
	};

	const openDialog = (provider: any) => {
		setSelectedProvider(provider);
		setDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
						<span className="text-2xl">🤖</span>
					</div>
					<div>
						<h2 className="text-xl font-semibold text-slate-900">API & AI Configuration</h2>
						<p className="text-slate-600 mt-1">Connect your preferred AI providers for enhanced functionality</p>
					</div>
				</div>
			</div>

			{/* API Providers */}
			<SectionCard title="AI Providers">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* OpenAI */}
					<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
									<span className="text-lg">🤖</span>
								</div>
								<div>
									<h3 className="font-medium text-slate-900">OpenAI</h3>
									<p className="text-sm text-slate-600">GPT-4, GPT-3.5</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{form.apiKeys?.openai && (
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								)}
								<button
									onClick={() => openDialog(API_PROVIDERS.find(p => p.id === 'openai'))}
									className="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									{form.apiKeys?.openai ? 'Update' : 'Configure'}
								</button>
							</div>
						</div>
						{form.apiKeys?.openai && (
							<div className="mt-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
								✓ API key configured
							</div>
						)}
					</div>

					{/* Google Gemini */}
					<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
									<span className="text-lg">💎</span>
								</div>
								<div>
									<h3 className="font-medium text-slate-900">Google Gemini</h3>
									<p className="text-sm text-slate-600">Gemini Pro, Pro Vision</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{form.apiKeys?.gemini && (
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								)}
								<button
									onClick={() => openDialog(API_PROVIDERS.find(p => p.id === 'gemini'))}
									className="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									{form.apiKeys?.gemini ? 'Update' : 'Configure'}
								</button>
							</div>
						</div>
						{form.apiKeys?.gemini && (
							<div className="mt-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
								✓ API key configured
							</div>
						)}
					</div>

					{/* Anthropic Claude */}
					<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
									<span className="text-lg">🧠</span>
								</div>
								<div>
									<h3 className="font-medium text-slate-900">Anthropic Claude</h3>
									<p className="text-sm text-slate-600">Claude 3 Opus, Sonnet</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{form.apiKeys?.anthropic && (
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								)}
								<button
									onClick={() => openDialog(API_PROVIDERS.find(p => p.id === 'anthropic'))}
									className="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									{form.apiKeys?.anthropic ? 'Update' : 'Configure'}
								</button>
							</div>
						</div>
						{form.apiKeys?.anthropic && (
							<div className="mt-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
								✓ API key configured
							</div>
						)}
					</div>

					{/* Cohere */}
					<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
									<span className="text-lg">⚡</span>
								</div>
								<div>
									<h3 className="font-medium text-slate-900">Cohere</h3>
									<p className="text-sm text-slate-600">Command, Command Light</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{form.apiKeys?.cohere && (
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								)}
								<button
									onClick={() => openDialog(API_PROVIDERS.find(p => p.id === 'cohere'))}
									className="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									{form.apiKeys?.cohere ? 'Update' : 'Configure'}
								</button>
							</div>
						</div>
						{form.apiKeys?.cohere && (
							<div className="mt-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
								✓ API key configured
							</div>
						)}
					</div>
				</div>
			</SectionCard>

			{/* Global AI Settings */}
			<SectionCard title="Global AI Settings">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Default AI Model
						</label>
						<select 
							className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={form.model} 
							onChange={(e) => setForm({ ...form, model: e.target.value })}
						>
							<option value="gpt-4o">GPT-4o (OpenAI)</option>
							<option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
							<option value="gemini-pro">Gemini Pro (Google)</option>
							<option value="claude-3-opus">Claude 3 Opus (Anthropic)</option>
							<option value="command">Command (Cohere)</option>
					</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Confidence Threshold
						</label>
						<input 
							className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							type="number" 
							step="0.01" 
							min={0} 
							max={1} 
							value={form.confidenceThreshold} 
							onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })} 
							placeholder="0.5"
						/>
						<p className="text-xs text-slate-500 mt-1">Minimum confidence for AI responses (0.0 - 1.0)</p>
					</div>
				</div>
			</SectionCard>

			{/* Usage & Billing */}
			<SectionCard title="Usage & Monitoring">
				<div className="bg-slate-50 rounded-lg p-4">
					<h4 className="font-medium text-slate-900 mb-3">API Usage This Month</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">1,247</div>
							<div className="text-sm text-slate-600">Total Requests</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">$23.45</div>
							<div className="text-sm text-slate-600">Total Cost</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">94.2%</div>
							<div className="text-sm text-slate-600">Success Rate</div>
						</div>
					</div>
				</div>
			</SectionCard>

			<div className="flex justify-end">
				<button 
					className="px-6 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors" 
					onClick={() => save.mutate()}
					disabled={save.isPending}
				>
					{save.isPending ? "Saving..." : "Save Settings"}
				</button>
			</div>

			<ApiKeyDialog
				isOpen={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSave={handleSaveApiKey}
				provider={selectedProvider}
				currentKey={selectedProvider ? form.apiKeys?.[selectedProvider.id] : undefined}
				currentModel={form.model}
			/>
		</div>
	);
}

function SystemTab() {
	const { data } = useQuery<{ data: any }>({ queryKey: ["settings", "system"], queryFn: async () => (await axios.get(`${API_BASE_URL}/api/settings/system`, { headers: { Authorization: `Bearer ${getToken()}` } })).data });
	const [form, setForm] = useState<any>({ dateFormat: "YYYY-MM-DD", language: "en", defaultExportFormat: "xlsx" });
	useEffect(() => setForm({ ...form, ...(data?.data || {}) }), [data]);
	const save = useMutation({
		mutationFn: async () => (await axios.post(`${API_BASE_URL}/api/settings/system`, form, { headers: { Authorization: `Bearer ${getToken()}` } })).data,
		onSuccess: () => toast.success("Saved system preferences"),
		onError: (e: any) => toast.error(e?.response?.data?.message || "Save failed"),
	});
	return (
		<div className="space-y-4">
			<SectionCard title="Preferences">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<select className="rounded-md border px-3 py-2" value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}>
						<option value="YYYY-MM-DD">YYYY-MM-DD</option>
						<option value="DD/MM/YYYY">DD/MM/YYYY</option>
						<option value="MM/DD/YYYY">MM/DD/YYYY</option>
					</select>
					<select className="rounded-md border px-3 py-2" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
						<option value="en">English</option>
						<option value="de">German</option>
						<option value="fr">French</option>
					</select>
					<select className="rounded-md border px-3 py-2" value={form.defaultExportFormat} onChange={(e) => setForm({ ...form, defaultExportFormat: e.target.value })}>
						<option value="xlsx">XLSX</option>
						<option value="csv">CSV</option>
						<option value="pdf">PDF</option>
					</select>
				</div>
			</SectionCard>
			<SectionCard title="Backup Config">
				<JsonEditor value={form.backupConfig} onChange={(v) => setForm({ ...form, backupConfig: v })} />
			</SectionCard>
			<div className="flex justify-end"><button className="px-4 py-2 rounded-md bg-slate-900 text-white" onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save"}</button></div>
		</div>
	);
}

function AuditTab() {
	const [filters, setFilters] = useState<{ userId?: string; module?: string; from?: string; to?: string }>({});
	const { data, refetch, isFetching } = useQuery<{ data: any[] }>({
		queryKey: ["settings", "audit", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
			return (await axios.get(`${API_BASE_URL}/api/settings/audit?${params.toString()}`, { headers: { Authorization: `Bearer ${getToken()}` } })).data;
		},
	});
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
				<input className="rounded-md border px-3 py-2" placeholder="User ID" value={filters.userId || ""} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} />
				<input className="rounded-md border px-3 py-2" placeholder="Module (e.g., settings)" value={filters.module || ""} onChange={(e) => setFilters({ ...filters, module: e.target.value })} />
				<input className="rounded-md border px-3 py-2" type="date" value={filters.from || ""} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
				<input className="rounded-md border px-3 py-2" type="date" value={filters.to || ""} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
			</div>
			<div className="flex justify-end"><button className="px-3 py-1.5 rounded-md border" onClick={() => refetch()}>{isFetching ? "Loading..." : "Apply Filters"}</button></div>
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-left text-slate-600">
							<th className="px-3 py-2">Date</th>
							<th className="px-3 py-2">User</th>
							<th className="px-3 py-2">Action</th>
							<th className="px-3 py-2">Module</th>
						</tr>
					</thead>
					<tbody>
						{data?.data?.map((l: any) => (
							<tr key={l.id} className="border-t border-slate-100">
								<td className="px-3 py-2">{new Date(l.timestamp).toLocaleString()}</td>
								<td className="px-3 py-2">{l.userId || "—"}</td>
								<td className="px-3 py-2">{l.action}</td>
								<td className="px-3 py-2">{l.module}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default function SettingsPage() {
	const tabs = useMemo(() => [
		{ id: "company", label: "Company Information", content: <CompanyInfoTab /> },
		{ id: "users", label: "User & Roles", content: <UsersTab /> },
		{ id: "coa", label: "COA Processing", content: <CoaTab /> },
		{ id: "ie", label: "Import/Export", content: <ImportExportTab /> },
		{ id: "q", label: "Questionnaires", content: <QuestionnaireTab /> },
		{ id: "ai", label: "API & AI", content: <AiTab /> },
		{ id: "system", label: "System Preferences", content: <SystemTab /> },
		{ id: "audit", label: "Audit Logs", content: <AuditTab /> },
	], []);
	return (
		<QueryClientProvider client={qc}>
			<div className="min-h-screen bg-slate-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center gap-4 mb-2">
							<div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
								<span className="text-2xl">⚙️</span>
							</div>
							<div>
								<h1 className="text-3xl font-bold text-slate-900">Settings</h1>
								<p className="text-slate-600">Manage your REDsync configuration and preferences</p>
							</div>
						</div>
					</div>
					
					{/* Content */}
					<div className="bg-white rounded-xl shadow-sm border border-slate-200">
				<Tabs tabs={tabs} />
					</div>
				</div>
			</div>
			<Toaster richColors position="top-right" />
		</QueryClientProvider>
	);
}

// duplicate export removed
