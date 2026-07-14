import type { UseFormSetValue } from "react-hook-form";
import type { DocumentValues } from "@/lib/documents/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SelectionTurnResponse {
  reply: string;
  slug: string | null;
}

export interface DocumentTurnResponse {
  reply: string;
  fields: DocumentValues;
  done: boolean;
}

export const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I'll help you put together a legal agreement. What kind of document would you like to create?";

async function post<T>(url: string, messages: ChatMessage[]): Promise<T> {
  const response = await fetch(url, {
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

export function sendSelectionChatTurn(messages: ChatMessage[]): Promise<SelectionTurnResponse> {
  return post<SelectionTurnResponse>("/api/documents/chat", messages);
}

export function sendDocumentChatTurn(
  slug: string,
  messages: ChatMessage[],
): Promise<DocumentTurnResponse> {
  return post<DocumentTurnResponse>(`/api/documents/${slug}/chat`, messages);
}

/**
 * Writes every non-null field from a chat turn's response into the shared
 * react-hook-form instance, walking nested party objects one level deep.
 * Leaves fields the model hasn't determined yet untouched rather than
 * clobbering them with null.
 */
export function applyChatFields(fields: DocumentValues, setValue: UseFormSetValue<DocumentValues>): void {
  // DocumentValues is a loosely-typed Record<string, unknown> since each
  // document has its own field shape, so react-hook-form's Path<T> can't
  // check these dot-paths at compile time.
  const set = setValue as unknown as (path: string, value: unknown) => void;

  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (subValue != null) set(`${key}.${subKey}`, subValue);
      }
    } else {
      set(key, value);
    }
  }
}
