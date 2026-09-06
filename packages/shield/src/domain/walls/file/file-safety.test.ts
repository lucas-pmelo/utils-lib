import { describe, expect, it } from "bun:test";
import { defaultLimits } from "../../traversal/limits";
import { fileSafetyWall } from "./file-safety";
import type { Limits, ScannedFile } from "../../models";

const PNG_HEAD = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MZ_HEAD = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);

function file(overrides: Partial<ScannedFile> = {}): ScannedFile {
  return { filename: "invoice.pdf", mimeType: "application/pdf", size: 1_000, ...overrides };
}

function limits(overrides: Partial<Limits> = {}): Limits {
  return { ...defaultLimits, ...overrides };
}

describe("fileSafetyWall", () => {
  it("should be a high-severity file wall", () => {
    expect(fileSafetyWall.kind).toBe("file");
    expect(fileSafetyWall.id).toBe("file-safety");
    expect(fileSafetyWall.severity).toBe("high");
  });

  it("should pass the file when name, size and magic bytes all agree", () => {
    const clean = file({ filename: "photo.png", mimeType: "image/png", head: PNG_HEAD });

    expect(fileSafetyWall.inspect(clean, 0, limits())).toBeNull();
  });

  it("should pass the file when no head is supplied to check magic bytes against", () => {
    expect(fileSafetyWall.inspect(file(), 0, limits())).toBeNull();
  });

  it("should flag the file when its size exceeds maxFileBytes", () => {
    const findings = fileSafetyWall.inspect(file({ size: 11 }), 0, limits({ maxFileBytes: 10 }));

    expect(findings).toHaveLength(1);
    expect(findings?.[0]).toMatchObject({
      wallId: "file-safety",
      surface: "file",
      severity: "high",
      path: "file[0].size",
    });
  });

  it("should flag the file when the filename hides an executable extension", () => {
    const findings = fileSafetyWall.inspect(file({ filename: "invoice.pdf.exe" }), 2, limits());

    expect(findings?.[0]).toMatchObject({ path: "file[2].filename" });
  });

  it("should flag the file when the magic bytes contradict the declared mime type", () => {
    const disguised = file({ filename: "photo.png", mimeType: "image/png", head: MZ_HEAD });

    const findings = fileSafetyWall.inspect(disguised, 0, limits());

    expect(findings?.[0]).toMatchObject({ path: "file[0].mimeType" });
    expect(findings?.[0].sample).toContain("application/x-msdownload");
  });

  it("should pass the file when the magic bytes match no known type", () => {
    const unknown = file({ head: new Uint8Array([0x00, 0x01, 0x02]) });

    expect(fileSafetyWall.inspect(unknown, 0, limits())).toBeNull();
  });

  it("should pass the file when magic bytes are known but no mime type was declared", () => {
    const undeclared = file({ filename: "photo.png", mimeType: undefined, head: PNG_HEAD });

    expect(fileSafetyWall.inspect(undeclared, 0, limits())).toBeNull();
  });

  it("should flag the file when its index is beyond maxFiles", () => {
    const findings = fileSafetyWall.inspect(file(), 3, limits({ maxFiles: 3 }));

    expect(findings?.[0]).toMatchObject({ path: "file[3]" });
  });

  it("should report every problem when one file trips several checks", () => {
    const hostile = file({
      filename: "../payload.pdf.exe",
      mimeType: "application/pdf",
      size: 99,
      head: MZ_HEAD,
    });

    const findings = fileSafetyWall.inspect(hostile, 0, limits({ maxFileBytes: 10 }));

    expect(findings?.map((f) => f.path)).toEqual([
      "file[0].size",
      "file[0].filename",
      "file[0].mimeType",
    ]);
  });
});
