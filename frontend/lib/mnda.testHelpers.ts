import { defaultMndaValues, type MndaFormValues } from "./mnda";

export function makeValues(overrides: Partial<MndaFormValues> = {}): MndaFormValues {
  return {
    ...defaultMndaValues,
    party1: { ...defaultMndaValues.party1 },
    party2: { ...defaultMndaValues.party2 },
    ...overrides,
  };
}
