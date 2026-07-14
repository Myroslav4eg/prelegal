import { readFile } from "fs/promises";
import path from "path";
import AuthGate from "@/components/AuthGate";
import DocumentApp from "@/components/DocumentApp";
import { REGISTRY } from "@/lib/documents/registry";

async function loadTemplates(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.values(REGISTRY).map(async (module) => {
      const templatePath = path.join(process.cwd(), "..", "templates", module.templateFile);
      return [module.slug, await readFile(templatePath, "utf-8")] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export default async function Home() {
  const templates = await loadTemplates();

  return (
    <AuthGate>
      <div className="document-scroll-pane mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-8 px-6 py-10">
        <DocumentApp templates={templates} />
      </div>
    </AuthGate>
  );
}
