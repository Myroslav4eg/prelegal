import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { defaultMndaValues, type MndaFormValues } from "@/lib/mnda";
import MndaForm from "./MndaForm";

/** Mirrors how MndaApp wires MndaForm to a real react-hook-form instance. */
function Harness() {
  const { register, watch } = useForm<MndaFormValues>({ defaultValues: defaultMndaValues });
  const mndaTermOption = watch("mndaTermOption");
  const confidentialityTermOption = watch("confidentialityTermOption");

  return (
    <MndaForm
      register={register}
      mndaTermOption={mndaTermOption}
      confidentialityTermOption={confidentialityTermOption}
    />
  );
}

describe("MndaForm", () => {
  it("renders the cover-page fields and both parties", () => {
    render(<Harness />);

    expect(screen.getByText("Purpose")).toBeInTheDocument();
    expect(screen.getByText("Effective Date")).toBeInTheDocument();
    expect(screen.getByText("MNDA Term")).toBeInTheDocument();
    expect(screen.getByText("Term of Confidentiality")).toBeInTheDocument();
    expect(screen.getByText("Governing Law & Jurisdiction")).toBeInTheDocument();
    expect(screen.getByText("MNDA Modifications")).toBeInTheDocument();
    expect(screen.getByText("Party 1")).toBeInTheDocument();
    expect(screen.getByText("Party 2")).toBeInTheDocument();
  });

  it("enables the MNDA Term years input only while 'Expires' is selected", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const [mndaYearsInput] = screen.getAllByRole("spinbutton");
    expect(mndaYearsInput).toBeEnabled();

    const untilTerminatedRadio = screen.getByRole("radio", {
      name: "Continues until terminated in accordance with the terms of the MNDA",
    });
    await user.click(untilTerminatedRadio);

    expect(mndaYearsInput).toBeDisabled();
  });

  it("enables the confidentiality years input only while the fixed-term option is selected", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const [, confidentialityYearsInput] = screen.getAllByRole("spinbutton");
    expect(confidentialityYearsInput).toBeEnabled();

    const perpetuityRadio = screen.getByRole("radio", { name: "In perpetuity" });
    await user.click(perpetuityRadio);

    expect(confidentialityYearsInput).toBeDisabled();
  });

  it("updates the Purpose field as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const [purposeTextarea] = screen.getAllByRole("textbox");

    await user.clear(purposeTextarea);
    await user.type(purposeTextarea, "Evaluating a joint venture");

    expect(purposeTextarea).toHaveValue("Evaluating a joint venture");
  });

  it("accepts party details for both parties independently", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const printNameInputs = screen.getAllByLabelText("Print Name");
    expect(printNameInputs).toHaveLength(2);

    await user.type(printNameInputs[0], "Jane Doe");
    await user.type(printNameInputs[1], "John Smith");

    expect(printNameInputs[0]).toHaveValue("Jane Doe");
    expect(printNameInputs[1]).toHaveValue("John Smith");
  });
});
