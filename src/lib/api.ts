export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function loginRequest(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let message = "Login failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function fetchMe(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

// COA API functions
export interface ColumnConfig {
  name: string;
  laboratory: string;
  type: string;
  phase: number;
  ignore: boolean;
  definition?: string;
  unit?: string;
  fullName?: string;
}

export async function fetchCoaColumns(phase?: string): Promise<{ columns: string[]; phase?: number; default?: boolean }> {
  const url = phase ? `${API_BASE_URL}/api/coa/columns?phase=${phase}` : `${API_BASE_URL}/api/coa/columns`;
  const res = await fetch(url, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch COA columns");
  return res.json();
}

export async function fetchCoaColumnsConfig(phase?: string): Promise<{ columnsConfig: ColumnConfig[]; phase?: number }> {
  const phaseParam = phase || "phase1-config";
  const res = await fetch(`${API_BASE_URL}/api/coa/columns?phase=${phaseParam}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch COA columns config");
  return res.json();
}

export interface CoaUploadResult {
  id?: string;  // Database ID for deletion functionality
  file: string;
  sample_id?: string;
  batch_id?: string;
  [key: string]: unknown;
}

export interface CoaUploadResponse {
  results: CoaUploadResult[];
}

export async function uploadCoaFiles(files: File[], token: string): Promise<CoaUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${API_BASE_URL}/api/coa-database/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let message = "Upload failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function exportCoaCsv(rows: CoaUploadResult[]): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${API_BASE_URL}/api/coa/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });

  if (!res.ok) {
    let message = "Export failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  let filename = `coa-export-${new Date().toISOString().split('T')[0]}.csv`;
  const match = cd.match(/filename="?([^";]+)"?/i);
  if (match?.[1]) filename = match[1];
  return { blob, filename };
}

export async function fetchCoaRecords(token: string): Promise<{ records: CoaUploadResult[] }> {
  const res = await fetch(`${API_BASE_URL}/api/coa-database/records`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch COA records from database");
  return res.json();
}

export async function deleteCoaRecords(recordIds: string[], token: string): Promise<{ deletedCount: number }> {
  const res = await fetch(`${API_BASE_URL}/api/coa-database/records`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recordIds }),
  });
  if (!res.ok) throw new Error("Failed to delete COA records");
  return res.json();
}

export async function cleanupCoaDuplicates(token: string): Promise<{ 
  message: string; 
  mergedRecords: number; 
  deletedRecords: number; 
  totalGroupsProcessed: number; 
  duplicateGroupsFound: number; 
}> {
  const res = await fetch(`${API_BASE_URL}/api/coa-database/cleanup-duplicates`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to cleanup COA duplicates");
  return res.json();
}

export async function testCoaNormalization(sampleIds: string[], token: string) {
  const res = await fetch(`${API_BASE_URL}/api/coa-database/test-normalization`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sampleIds }),
  });
  if (!res.ok) throw new Error("Failed to test COA normalization");
  return res.json();
}

export async function testCoaFilenameExtraction(filenames: string[], token: string) {
  const res = await fetch(`${API_BASE_URL}/api/coa-database/test-filename-extraction`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filenames }),
  });
  if (!res.ok) throw new Error("Failed to test COA filename extraction");
  return res.json();
}

// Import/Export API functions
export interface ImportExportRow {
  "Product Name": string;
  "Importer/Exporter": string;
  "Quantity": number | null;
  "Price": number | null;
  "Incoterm": string;
  "Currency": string;
  "Company": string;  // Changed from Country - now stores exporter name for exports, supplier name for imports
  "Flow": string;
  "HS Code": string;
  "Competitor": string;
  "Matched Product": string;
  "Source File": string;
  "Created": string;
}

export interface ImportExportProcessResult {
  headers: string[];
  rows: ImportExportRow[];
  totalRows: number;
}

export async function processImportExportFiles(files: File[], token: string): Promise<ImportExportProcessResult> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${API_BASE_URL}/api/import-export/process`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let message = "Processing failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

// Analytics API
export async function fetchImportExportMonthly(params: { product?: string; company?: string; year?: number; token: string }) {
  const qs = new URLSearchParams();
  if (params.product) qs.set('product', params.product);
  if (params.company) qs.set('company', params.company);
  if (params.year) qs.set('year', String(params.year));
  const res = await fetch(`${API_BASE_URL}/api/import-export/analytics/monthly?${qs.toString()}`, { 
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${params.token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch monthly analytics');
  return res.json();
}

export async function fetchImportExportGrouped(params: { product?: string; token: string }) {
  const qs = new URLSearchParams();
  if (params.product) qs.set('product', params.product);
  const res = await fetch(`${API_BASE_URL}/api/import-export/analytics/grouped?${qs.toString()}`, { 
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${params.token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch grouped list');
  return res.json();
}

export async function fetchImportExportUndefined(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/import-export/analytics/undefined`, { 
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch undefined list');
  return res.json();
}

export async function fetchImportExportRecords(token: string, page = 1, limit = 1000) {
  const res = await fetch(`${API_BASE_URL}/api/import-export/records?page=${page}&limit=${limit}`, { 
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch import/export records');
  return res.json();
}

export async function fetchImportExportCompanies(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/import-export/analytics/companies`, { 
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch companies list');
  return res.json();
}

// Questionnaire API functions
export interface ParsedQuestion {
  id: string;
  text: string;
  context?: string;
}

export interface QuestionnaireUploadResponse {
  questionnaireId: string;
  parsedQuestions: ParsedQuestion[];
}

export interface QuestionnaireAnswer {
  id: string;
  questionnaireId: string;
  question: string;
  answer: string | null;
  source: 'company_info' | 'certification' | 'ai' | 'skip';
  createdAt: string;
  updatedAt: string;
}

export interface Questionnaire {
  id: string;
  originalFile: string;
  processedFile: string | null;
  status: 'uploaded' | 'processing' | 'processed' | 'failed' | 'draft';
  metadata: Record<string, unknown> | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  answers: QuestionnaireAnswer[];
}

export interface QuestionnaireProcessResponse {
  questionnaireId: string;
  processedFile: string;
  answersCount: number;
}

export async function uploadQuestionnaireFiles(files: File[], token: string): Promise<QuestionnaireUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${API_BASE_URL}/api/questionnaires/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let message = "Upload failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function processQuestionnaire(
  questionnaireId: string, 
  parsedQuestions: ParsedQuestion[], 
  token: string
): Promise<QuestionnaireProcessResponse> {
  const res = await fetch(`${API_BASE_URL}/api/questionnaires/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ questionnaireId, parsedQuestions }),
  });

  if (!res.ok) {
    let message = "Processing failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function fetchQuestionnaire(questionnaireId: string, token: string): Promise<Questionnaire> {
  const res = await fetch(`${API_BASE_URL}/api/questionnaires/${questionnaireId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = "Failed to fetch questionnaire";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function updateQuestionnaireAnswer(
  questionnaireId: string,
  answerId: string,
  newAnswer: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/questionnaires/${questionnaireId}/answers/${answerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answer: newAnswer }),
  });

  if (!res.ok) {
    let message = "Failed to update answer";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
}

export interface SaveDraftResponse {
  questionnaireId: string;
  status: string;
  answersUpdated: number;
}

export async function saveDraft(
  questionnaireId: string,
  answers: { questionId: string; answer: string }[],
  token: string
): Promise<SaveDraftResponse> {
  const res = await fetch(`${API_BASE_URL}/api/questionnaires/${questionnaireId}/draft`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    let message = "Failed to save draft";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export interface QuestionnairesResponse {
  questionnaires: Questionnaire[];
  total: number;
  stats: {
    processed: number;
    draft: number;
    processing: number;
    failed: number;
    totalAnswers: number;
    totalFromDatabase: number;
    totalFromAI: number;
  };
}

export async function fetchQuestionnaires(
  status: string = "all",
  limit: number = 20,
  token: string
): Promise<QuestionnairesResponse> {
  const params = new URLSearchParams({ status, limit: limit.toString() });
  const res = await fetch(`${API_BASE_URL}/api/questionnaires?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = "Failed to fetch questionnaires";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function deleteQuestionnaire(questionnaireId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/questionnaires/${questionnaireId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = "Failed to delete questionnaire";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
}

// Dashboard API functions
export interface COAStats {
  totalSamplesThisMonth: number;
  totalFiles: number;
  avgProcessingTime: string;
  lastUploadDate: string | null;
  monthlyUploads: Array<{ month: string; uploads: number }>;
}

export interface ImportExportStats {
  totalRecords: number;
  totalFiles: number;
  avgProcessingTime: number;
  lastUploadDate: string | null;
  monthlyUploads: Array<{ month: string; count: number }>;
}

// Legacy interface for backward compatibility
export interface ImportExportStatsLegacy {
  tradeRecordsThisMonth: number;
  priceTrend: string;
  totalImports: number;
  totalExports: number;
  avgPriceThisMonth: number;
  monthlyPrices: Array<{ month: string; avgPrice: number; imports: number; exports: number }>;
}

export interface QuestionnaireStats {
  totalProcessed: number;
  avgAutoAnswered: string;
  lastProcessedDate: string | null;
  totalDrafts: number;
  totalQuestions: number;
  databaseAnswers: number;
  aiAnswers: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  name: string;
  date: string;
  status: string;
  module: string;
}

export interface RecentActivityResponse {
  activities: RecentActivity[];
  total: number;
}

export async function fetchCOAStats(token: string): Promise<COAStats> {
  const res = await fetch(`${API_BASE_URL}/api/coa-database/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch COA statistics");
  }

  return res.json();
}

export async function fetchImportExportStats(token: string): Promise<ImportExportStats> {
  const res = await fetch(`${API_BASE_URL}/api/import-export/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Import/Export statistics");
  }

  return res.json();
}

export async function fetchQuestionnaireStats(token: string): Promise<QuestionnaireStats> {
  const res = await fetch(`${API_BASE_URL}/api/questionnaires/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch questionnaire statistics");
  }

  return res.json();
}

export async function fetchRecentActivity(token: string, limit: number = 10): Promise<RecentActivityResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  const res = await fetch(`${API_BASE_URL}/api/dashboard/recent-activity?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  return res.json();
}

