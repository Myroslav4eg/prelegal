import { readFile } from "fs/promises";
import path from "path";
import { REGISTRY } from "@/lib/documents/registry";

export async function loadTemplates(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.values(REGISTRY).map(async (module) => {
      const templatePath = path.join(process.cwd(), "..", "templates", module.templateFile);
      return [module.slug, await readFile(templatePath, "utf-8")] as const;
    }),
  );
  return Object.fromEntries(entries);
}
