import { describe, expect, it } from "bun:test";
import { isMimeCompatible } from "./mime-compat.js";

describe("isMimeCompatible", () => {
  it("should accept an exact match", () => {
    expect(isMimeCompatible("image/png", "image/png")).toBe(true);
  });

  it("should accept a declared type carrying parameters", () => {
    expect(isMimeCompatible("application/pdf; charset=binary", "application/pdf")).toBe(true);
  });

  it.each([
    ["image/jpg", "image/jpeg"],
    ["image/pjpeg", "image/jpeg"],
    ["application/x-zip-compressed", "application/zip"],
    ["application/x-gzip", "application/gzip"],
  ])("should fold the alias %s onto %s", (declared, detected) => {
    expect(isMimeCompatible(declared, detected)).toBe(true);
  });

  it.each([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/java-archive",
    "application/epub+zip",
    "application/vnd.android.package-archive",
  ])("should accept %s reading as a zip container", (declared) => {
    expect(isMimeCompatible(declared, "application/zip")).toBe(true);
  });

  it("should still reject an executable declared as an image", () => {
    expect(isMimeCompatible("image/png", "application/x-msdownload")).toBe(false);
  });

  it("should not let the zip allowance cover an unrelated declared type", () => {
    expect(isMimeCompatible("image/png", "application/zip")).toBe(false);
  });
});
