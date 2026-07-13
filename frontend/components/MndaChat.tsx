"use client";

import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { MndaFormValues } from "@/lib/mnda";
import {
  applyMndaChatFields,
  INITIAL_ASSISTANT_MESSAGE,
  sendMndaChatTurn,
  type ChatMessage,
} from "@/lib/mndaChat";

const bubbleClasses = {
  assistant:
    "self-start rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/10",
  user: "self-end rounded-lg bg-blue-primary px-3 py-2 text-sm text-white",
};

export default function MndaChat({ setValue }: { setValue: UseFormSetValue<MndaFormValues> }) {
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
      const result = await sendMndaChatTurn(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
      applyMndaChatFields(result.fields, setValue);
      setDone(result.done);
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
    <div className="flex flex-col gap-4">
      <div data-testid="chat-messages" className="flex flex-col gap-2">
        {messages.map((message, index) => (
          <p key={index} className={bubbleClasses[message.role]}>
            {message.content}
          </p>
        ))}
      </div>

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

      <form onSubmit={handleSubmit} className="flex gap-2">
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
