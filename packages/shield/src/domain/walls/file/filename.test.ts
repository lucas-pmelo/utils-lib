import { describe, expect, it } from "bun:test";
import { isUnsafeFilename } from "./filename";

describe("isUnsafeFilename", () => {
  it.each([
    "../../etc/passwd",
    "..\\windows\\system32\\cmd",
    "report%2e%2e/x.pdf",
    "clean\0.png",
    "invoice.pdf.exe",
    "photo.jpg.js",
    "installer.msi",
    "script.SH",
  ])("should reject the filename when it is %j", (filename) => {
    expect(isUnsafeFilename(filename)).toBe(true);
  });

  it.each([
    "invoice.pdf",
    "photo.jpg",
    "annual report 2026.xlsx",
    "archive.tar.gz",
    "no-extension",
  ])("should accept the filename when it is %j", (filename) => {
    expect(isUnsafeFilename(filename)).toBe(false);
  });
});
