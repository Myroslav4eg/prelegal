"use client";

import { useEffect, useState } from "react";
import { getHistoryEntry, listHistory, type DocumentDetail, type DocumentSummary } from "@/lib/documentHistory";
import DocumentHistoryList from "@/components/DocumentHistoryList";
import DocumentHistoryDetail from "@/components/DocumentHistoryDetail";

type ListStatus = "loading" | "ready" | "error";

export default function DocumentHistoryApp({ templates }: { templates: Record<string, string> }) {
  const [entries, setEntries] = useState<DocumentSummary[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    listHistory()
      .then((result) => {
        setEntries(result);
        setListStatus("ready");
        if (result.length > 0) setSelectedId(result[0].id);
      })
      .catch(() => setListStatus("error"));
  }, []);

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setDetailError(false);
    getHistoryEntry(selectedId)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch(() => {
        if (!cancelled) setDetailError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <>
      <header className="print:hidden">
        <h1 className="text-2xl font-bold text-dark-navy dark:text-foreground">Documents</h1>
        <p className="text-sm text-foreground/60">Agreements you&apos;ve previously completed.</p>
      </header>

      {listStatus === "loading" && <p className="text-sm text-foreground/60 print:hidden">Loading...</p>}

      {listStatus === "error" && (
        <p className="text-sm text-red-600 print:hidden">Something went wrong loading your documents.</p>
      )}

      {listStatus === "ready" && entries.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 py-16 text-center print:hidden dark:border-white/15">
          <p className="text-sm font-medium text-dark-navy dark:text-foreground">No documents yet</p>
          <p className="text-sm text-foreground/60">
            Completed agreements will show up here once you finish one in the chat.
          </p>
        </div>
      )}

      {listStatus === "ready" && entries.length > 0 && (
        <div className="document-scroll-pane grid grid-cols-1 gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[16rem_1fr] lg:grid-rows-[minmax(0,1fr)]">
          <section className="print:hidden lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <DocumentHistoryList entries={entries} selectedId={selectedId} onSelect={setSelectedId} />
          </section>
          <section className="document-scroll-pane flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pl-2">
            {detailError && (
              <p className="text-sm text-red-600 print:hidden">Something went wrong loading this document.</p>
            )}
            {detail && <DocumentHistoryDetail detail={detail} templates={templates} />}
          </section>
        </div>
      )}
    </>
  );
}
