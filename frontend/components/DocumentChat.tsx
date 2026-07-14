"use client";

import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { DocumentValues } from "@/lib/documents/types";
import {
  applyChatFields,
  INITIAL_ASSISTANT_MESSAGE,
  sendDocumentChatTurn,
  sendSelectionChatTurn,
  type ChatMessage,
} from "@/lib/documentChat";

const bubbleClasses = {
  assistant: "self-start rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/10",
  user: "self-end rounded-lg bg-blue-primary px-3 py-2 text-sm text-white",
};

export default function DocumentChat({
  setValue,
  onDocumentSelected,
}: {
  setValue: UseFormSetValue<DocumentValues>;
  onDocumentSelected: (slug: string) => void;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [done, setDone] = useState(false);

  async function sendTurn(nextMessages: ChatMessage[]) {
    setMessages(nextMessages);
    setStatus("sending");
    try {
      if (slug == null) {
        const result = await sendSelectionChatTurn(nextMessages);
        setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
        if (result.slug) {
          setSlug(result.slug);
          onDocumentSelected(result.slug);
        }
      } else {
        const result = await sendDocumentChatTurn(slug, nextMessages);
        setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
        applyChatFields(result.fields, setValue);
        setDone(result.done);
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void sendTurn([...messages, { role: "user", content: text }]);
  }

  function retry() {
    void sendTurn(messages);
  }

  return (
    <div className="flex h-[32rem] shrink-0 flex-col rounded-lg border border-blue-primary/30 bg-white shadow-sm dark:border-blue-primary/40 dark:bg-black/40">
      <div data-testid="chat-messages" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <p key={index} className={bubbleClasses[message.role]}>
            {message.content}
          </p>
        ))}

        {done && (
          <p className="rounded-md bg-accent-yellow/20 px-3 py-2 text-sm text-dark-navy dark:text-foreground">
            Your agreement is ready — review it on the right, or keep chatting to make changes.
          </p>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span>Something went wrong. Please try again.</span>
            <button type="button" onClick={retry} className="underline">
              Retry
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-black/10 p-3 dark:border-white/10">
        <input
          className="flex-1 rounded-md border border-black/15 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-primary focus:outline-none dark:border-white/15 dark:bg-black"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={status === "sending"}
          placeholder="Type your answer..."
        />
        <button
          type="submit"
          disabled={status === "sending" || !draft.trim()}
          className="rounded-md bg-purple-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
