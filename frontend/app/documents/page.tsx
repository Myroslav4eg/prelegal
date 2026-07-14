import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import DocumentHistoryApp from "@/components/DocumentHistoryApp";
import { loadTemplates } from "@/lib/documents/loadTemplates";

export default async function DocumentsPage() {
  const templates = await loadTemplates();

  return (
    <AuthGate>
      <AppShell>
        <DocumentHistoryApp templates={templates} />
      </AppShell>
    </AuthGate>
  );
}
