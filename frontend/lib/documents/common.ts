import type { DocumentValues, PartyDetails, Substitutions } from "./types";

export { blankParty } from "./types";

export function getValue(values: DocumentValues, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, values);
}

export function getParty(values: DocumentValues, key: string): PartyDetails {
  const value = getValue(values, key) as Partial<PartyDetails> | undefined;
  return {
    name: value?.name ?? "",
    title: value?.title ?? "",
    company: value?.company ?? "",
    noticeAddress: value?.noticeAddress ?? "",
  };
}

export function formatLongDate(dateStr: unknown): string {
  if (typeof dateStr !== "string" || !dateStr) return "[Today's date]";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "[Today's date]";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function textValue(values: DocumentValues, key: string, fallback = ""): string {
  const value = getValue(values, key);
  return typeof value === "string" && value.trim() ? value : fallback;
}

/**
 * Merges the party-role-name substitutions (e.g. "Customer" / "Customer's")
 * that recur throughout a document's body text with the caller's own
 * substitutions for that same span class.
 */
export function roleAliases(
  role: string,
  party: PartyDetails,
  fallback = role,
): Record<string, string> {
  const name = party.company.trim() || fallback;
  return { [role]: name, [`${role}'s`]: `${name}'s`, [`${role}’s`]: `${name}’s` };
}

/**
 * Fixed defaults for the "advanced" liability/indemnification terms several
 * of the Common Paper templates define (Additional Warranties, Increased
 * Claims/Cap Amount, Unlimited Claims, an optional DPA reference, and each
 * role's Covered Claim(s)) that this app's chat does not ask about - keeping
 * the chat focused on the primary business terms. Without these, the spans
 * for these terms would render as literal, unfilled HTML in the document.
 */
export function standardLiabilityDefaults(roleA: string, roleB: string): Record<string, string> {
  return {
    "Additional Warranties": "None.",
    "Increased Claims": "None.",
    "Increased Cap Amount": "the General Cap Amount",
    "Unlimited Claims": "None.",
    DPA: "the parties' Data Processing Agreement, if any",
    [`${roleA} Covered Claim`]: `claims arising from ${roleA}'s indemnification obligations under this Agreement`,
    [`${roleA} Covered Claims`]: `claims arising from ${roleA}'s indemnification obligations under this Agreement`,
    [`${roleB} Covered Claim`]: `claims arising from ${roleB}'s indemnification obligations under this Agreement`,
    [`${roleB} Covered Claims`]: `claims arising from ${roleB}'s indemnification obligations under this Agreement`,
  };
}

export function mergeSubstitutions(...parts: Substitutions[]): Substitutions {
  const result: Substitutions = {};
  for (const part of parts) {
    for (const [spanClass, entries] of Object.entries(part)) {
      result[spanClass] = { ...result[spanClass], ...entries };
    }
  }
  return result;
}

const SPAN_RE = /<span class="([a-z_]+)">([^<]+)<\/span>/g;

/**
 * The Standard Terms markdown references fields via
 * `<span class="span_class">Label</span>` placeholders, possibly under
 * several different span classes in one document. Replaces each with its
 * substitution value, bolded, leaving the original span untouched if no
 * substitution is found for that exact (spanClass, label) pair - which also
 * makes an unmapped label visible during development instead of silent.
 */
export function substituteTemplate(raw: string, substitutions: Substitutions): string {
  return raw.replace(SPAN_RE, (match, spanClass: string, label: string) => {
    const value = substitutions[spanClass]?.[label];
    return value ? `**${value}**` : match;
  });
}
