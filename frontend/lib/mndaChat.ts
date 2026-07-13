import type { UseFormSetValue } from "react-hook-form";
import type { MndaFormValues } from "@/lib/mnda";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PartyFieldsResponse {
  name: string | null;
  title: string | null;
  company: string | null;
  noticeAddress: string | null;
}

export interface MndaChatFieldsResponse {
  purpose: string | null;
  effectiveDate: string | null;
  mndaTermOption: MndaFormValues["mndaTermOption"] | null;
  mndaTermYears: number | null;
  confidentialityTermOption: MndaFormValues["confidentialityTermOption"] | null;
  confidentialityTermYears: number | null;
  governingLaw: string | null;
  jurisdiction: string | null;
  modifications: string | null;
  party1: PartyFieldsResponse | null;
  party2: PartyFieldsResponse | null;
}

export interface MndaChatTurnResponse {
  reply: string;
  fields: MndaChatFieldsResponse;
  done: boolean;
}

/** Fixed first question, asked before any backend round-trip (see MndaChat). */
export const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I'll help you put together your Mutual NDA. What's the purpose — how may Confidential Information be used?";

export async function sendMndaChatTurn(messages: ChatMessage[]): Promise<MndaChatTurnResponse> {
  const response = await fetch("/api/mnda/chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    throw new Error("Chat request failed");
  }
  return response.json();
}

const PARTY_KEYS = ["name", "title", "company", "noticeAddress"] as const;

/**
 * Writes every non-null field from a chat turn's response into the shared
 * react-hook-form instance, leaving fields the model hasn't determined yet
 * untouched rather than clobbering them with null.
 */
export function applyMndaChatFields(
  fields: MndaChatFieldsResponse,
  setValue: UseFormSetValue<MndaFormValues>,
): void {
  if (fields.purpose != null) setValue("purpose", fields.purpose);
  if (fields.effectiveDate != null) setValue("effectiveDate", fields.effectiveDate);
  if (fields.mndaTermOption != null) setValue("mndaTermOption", fields.mndaTermOption);
  if (fields.mndaTermYears != null) setValue("mndaTermYears", fields.mndaTermYears);
  if (fields.confidentialityTermOption != null)
    setValue("confidentialityTermOption", fields.confidentialityTermOption);
  if (fields.confidentialityTermYears != null)
    setValue("confidentialityTermYears", fields.confidentialityTermYears);
  if (fields.governingLaw != null) setValue("governingLaw", fields.governingLaw);
  if (fields.jurisdiction != null) setValue("jurisdiction", fields.jurisdiction);
  if (fields.modifications != null) setValue("modifications", fields.modifications);

  for (const party of ["party1", "party2"] as const) {
    const incoming = fields[party];
    if (incoming == null) continue;
    for (const key of PARTY_KEYS) {
      const value = incoming[key];
      if (value != null) setValue(`${party}.${key}`, value);
    }
  }
}
