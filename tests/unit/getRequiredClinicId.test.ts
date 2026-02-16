import { describe, it, expect } from "vitest";
import { getRequiredClinicId } from "../../src/lib/getRequiredClinicId";

describe("getRequiredClinicId", () => {
  it("returns clinicId when present", () => {
    const clinicId = getRequiredClinicId({ clinicId: "abc-123" } as any);
    expect(clinicId).toBe("abc-123");
  });

  it("throws when clinicId is missing", () => {
    expect(() => getRequiredClinicId({} as any)).toThrow();
  });
});
