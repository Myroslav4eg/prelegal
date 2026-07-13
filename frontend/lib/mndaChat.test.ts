import { describe, expect, it, vi, beforeEach } from "vitest";
import { applyMndaChatFields, sendMndaChatTurn, type MndaChatFieldsResponse } from "./mndaChat";

const emptyFields: MndaChatFieldsResponse = {
  purpose: null,
  effectiveDate: null,
  mndaTermOption: null,
  mndaTermYears: null,
  confidentialityTermOption: null,
  confidentialityTermYears: null,
  governingLaw: null,
  jurisdiction: null,
  modifications: null,
  party1: null,
  party2: null,
};

describe("applyMndaChatFields", () => {
  it("calls setValue for every non-null top-level field", () => {
    const setValue = vi.fn();
    applyMndaChatFields({ ...emptyFields, purpose: "Evaluate a deal", governingLaw: "Delaware" }, setValue);

    expect(setValue).toHaveBeenCalledWith("purpose", "Evaluate a deal");
    expect(setValue).toHaveBeenCalledWith("governingLaw", "Delaware");
    expect(setValue).toHaveBeenCalledTimes(2);
  });

  it("does not call setValue for null fields", () => {
    const setValue = vi.fn();
    applyMndaChatFields(emptyFields, setValue);

    expect(setValue).not.toHaveBeenCalled();
  });

  it("calls setValue with dot-paths for non-null party sub-fields only", () => {
    const setValue = vi.fn();
    applyMndaChatFields(
      { ...emptyFields, party1: { name: "Jane Doe", title: null, company: null, noticeAddress: null } },
      setValue,
    );

    expect(setValue).toHaveBeenCalledWith("party1.name", "Jane Doe");
    expect(setValue).toHaveBeenCalledTimes(1);
  });

  it("leaves party2 untouched when it is null", () => {
    const setValue = vi.fn();
    applyMndaChatFields({ ...emptyFields, party1: { name: "Jane Doe", title: null, company: null, noticeAddress: null } }, setValue);

    expect(setValue).not.toHaveBeenCalledWith(expect.stringMatching(/^party2\./), expect.anything());
  });
});

describe("sendMndaChatTurn", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("posts the message history and returns the parsed response", async () => {
    const payload = { reply: "Hi", fields: emptyFields, done: false };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const messages = [{ role: "user" as const, content: "hello" }];
    const result = await sendMndaChatTurn(messages);

    expect(fetch).toHaveBeenCalledWith(
      "/api/mnda/chat",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ messages }),
      }),
    );
    expect(result).toEqual(payload);
  });

  it("throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 502 }));

    await expect(sendMndaChatTurn([])).rejects.toThrow();
  });
});
