"use client";

import { UseFormRegister } from "react-hook-form";
import type { MndaFormValues } from "@/lib/mnda";

const inputClasses =
  "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm shadow-sm focus:border-black/40 focus:outline-none dark:border-white/15 dark:bg-black dark:focus:border-white/40";
const labelClasses = "text-sm font-medium text-foreground";
const fieldsetClasses = "flex flex-col gap-4 border-t border-black/10 pt-6 first:border-t-0 first:pt-0 dark:border-white/10";

function PartyFields({
  register,
  party,
  title,
}: {
  register: UseFormRegister<MndaFormValues>;
  party: "party1" | "party2";
  title: string;
}) {
  return (
    <fieldset className={fieldsetClasses}>
      <legend className="mb-1 text-base font-semibold">{title}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Print Name</span>
          <input className={inputClasses} {...register(`${party}.name`)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Title</span>
          <input className={inputClasses} {...register(`${party}.title`)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Company</span>
          <input className={inputClasses} {...register(`${party}.company`)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Notice Address</span>
          <input
            className={inputClasses}
            placeholder="Email or postal address"
            {...register(`${party}.noticeAddress`)}
          />
        </label>
      </div>
    </fieldset>
  );
}

export default function MndaForm({
  register,
  mndaTermOption,
  confidentialityTermOption,
}: {
  register: UseFormRegister<MndaFormValues>;
  mndaTermOption: MndaFormValues["mndaTermOption"];
  confidentialityTermOption: MndaFormValues["confidentialityTermOption"];
}) {
  return (
    <form className="flex flex-col gap-6">
      <fieldset className={fieldsetClasses}>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Purpose</span>
          <span className="text-xs text-foreground/60">How Confidential Information may be used</span>
          <textarea className={inputClasses} rows={2} {...register("purpose")} />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Effective Date</span>
          <input type="date" className={inputClasses} {...register("effectiveDate")} />
        </label>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <legend className="mb-1 text-base font-semibold">MNDA Term</legend>
        <span className="text-xs text-foreground/60">The length of this MNDA</span>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="expires" {...register("mndaTermOption")} />
          Expires
          <input
            type="number"
            min={1}
            className={`${inputClasses} w-20`}
            disabled={mndaTermOption !== "expires"}
            {...register("mndaTermYears", { valueAsNumber: true })}
          />
          year(s) from Effective Date
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="until_terminated" {...register("mndaTermOption")} />
          Continues until terminated in accordance with the terms of the MNDA
        </label>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <legend className="mb-1 text-base font-semibold">Term of Confidentiality</legend>
        <span className="text-xs text-foreground/60">How long Confidential Information is protected</span>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="years" {...register("confidentialityTermOption")} />
          <input
            type="number"
            min={1}
            className={`${inputClasses} w-20`}
            disabled={confidentialityTermOption !== "years"}
            {...register("confidentialityTermYears", { valueAsNumber: true })}
          />
          year(s) from Effective Date (trade secrets excepted)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="perpetuity" {...register("confidentialityTermOption")} />
          In perpetuity
        </label>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <legend className="mb-1 text-base font-semibold">Governing Law & Jurisdiction</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={labelClasses}>Governing Law</span>
            <input className={inputClasses} placeholder="e.g., Delaware" {...register("governingLaw")} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClasses}>Jurisdiction</span>
            <input
              className={inputClasses}
              placeholder="e.g., New Castle, DE"
              {...register("jurisdiction")}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>MNDA Modifications</span>
          <span className="text-xs text-foreground/60">List any modifications to the MNDA</span>
          <textarea className={inputClasses} rows={2} {...register("modifications")} />
        </label>
      </fieldset>

      <PartyFields register={register} party="party1" title="Party 1" />
      <PartyFields register={register} party="party2" title="Party 2" />
    </form>
  );
}
