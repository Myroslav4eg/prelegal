import type { DocumentValues } from "@/lib/documents/types";

export interface DocumentSummary {
  id: number;
  slug: string;
  documentTitle: string;
  createdAt: string;
}

export interface DocumentDetail extends DocumentSummary {
  fields: DocumentValues;
  updatedAt: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error("History request failed");
  }
  return response.json();
}

export function listHistory(): Promise<DocumentSummary[]> {
  return request<DocumentSummary[]>("/api/history");
}

export function getHistoryEntry(id: number): Promise<DocumentDetail> {
  return request<DocumentDetail>(`/api/history/${id}`);
}

export function createHistoryEntry(slug: string, fields: DocumentValues): Promise<DocumentDetail> {
  return request<DocumentDetail>("/api/history", {
    method: "POST",
    body: JSON.stringify({ slug, fields }),
  });
}

export function updateHistoryEntry(id: number, fields: DocumentValues): Promise<DocumentDetail> {
  return request<DocumentDetail>(`/api/history/${id}`, {
    method: "PUT",
    body: JSON.stringify({ fields }),
  });
}
