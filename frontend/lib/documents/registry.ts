import type { DocumentModule } from "./types";
import { aiAddendum } from "./aiAddendum";
import { baa } from "./baa";
import { csa } from "./csa";
import { designPartner } from "./designPartner";
import { dpa } from "./dpa";
import { mnda } from "./mnda";
import { partnership } from "./partnership";
import { pilot } from "./pilot";
import { psa } from "./psa";
import { sla } from "./sla";
import { softwareLicense } from "./softwareLicense";

export const REGISTRY: Record<string, DocumentModule> = Object.fromEntries(
  [mnda, pilot, designPartner, partnership, baa, csa, psa, softwareLicense, sla, dpa, aiAddendum].map(
    (module) => [module.slug, module],
  ),
);
