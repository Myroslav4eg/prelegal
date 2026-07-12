import { readFile } from "fs/promises";
import path from "path";
import MndaApp from "@/components/MndaApp";

async function loadStandardTerms(): Promise<string> {
  const templatePath = path.join(process.cwd(), "..", "templates", "Mutual-NDA.md");
  return readFile(templatePath, "utf-8");
}

export default async function Home() {
  const rawStandardTerms = await loadStandardTerms();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1 print:hidden">
        <h1 className="text-2xl font-bold">Mutual NDA Creator</h1>
        <p className="text-sm text-foreground/60">
          Fill in the form to generate a Common Paper Mutual Non-Disclosure Agreement, then download it as
          a PDF.
        </p>
      </header>
      <MndaApp rawStandardTerms={rawStandardTerms} />
    </div>
  );
}
