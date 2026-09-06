import { describe, expect, it } from "bun:test";
import { detectMimeFromMagic } from "./magic-bytes.js";

function head(...bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}

describe("detectMimeFromMagic", () => {
  it("should detect image/png when the head carries the PNG signature", () => {
    expect(detectMimeFromMagic(head(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(
      "image/png",
    );
  });

  it("should detect image/jpeg when the head carries the JPEG signature", () => {
    expect(detectMimeFromMagic(head(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
  });

  it("should detect application/pdf when the head carries the PDF signature", () => {
    expect(detectMimeFromMagic(head(0x25, 0x50, 0x44, 0x46, 0x2d))).toBe("application/pdf");
  });

  it("should detect application/x-msdownload when the head carries the MZ signature", () => {
    expect(detectMimeFromMagic(head(0x4d, 0x5a, 0x90, 0x00))).toBe("application/x-msdownload");
  });

  it("should detect application/x-elf when the head carries the ELF signature", () => {
    expect(detectMimeFromMagic(head(0x7f, 0x45, 0x4c, 0x46))).toBe("application/x-elf");
  });

  it("should return undefined when the head matches no known signature", () => {
    expect(detectMimeFromMagic(head(0x00, 0x01, 0x02, 0x03))).toBeUndefined();
  });

  it("should return undefined when the head is shorter than the signature", () => {
    expect(detectMimeFromMagic(head(0x89, 0x50))).toBeUndefined();
  });
});
