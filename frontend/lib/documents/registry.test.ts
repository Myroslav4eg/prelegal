import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { REGISTRY } from "./registry";
import { substituteTemplate } from "./common";

const SPAN_RE = /<span class="[a-z_]+">[^<]+<\/span>/g;

describe.each(Object.values(REGISTRY))("$slug", (module) => {
  const templatePath = path.join(__dirname, "..", "..", "..", "templates", module.templateFile);
  const raw = readFileSync(templatePath, "utf-8");

  it("leaves no unmapped <span> placeholders when filled with default values", () => {
    const filled = substituteTemplate(raw, module.buildSubstitutions(module.defaultValues));
    const remaining = filled.match(SPAN_RE) ?? [];

    expect(remaining).toEqual([]);
  });

  it("has a non-empty documentTitle, subtitle, and at least one field group", () => {
    expect(module.documentTitle).toBeTruthy();
    expect(module.subtitle).toBeTruthy();
    expect(module.groups.length).toBeGreaterThan(0);
  });
});
