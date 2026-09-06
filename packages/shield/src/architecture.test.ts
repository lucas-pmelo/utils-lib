import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dir);
const WEB_FRAMEWORKS = ["elysia", "express", "fastify", "aws-lambda", "koa", "hapi", "next"];

function sourceFilesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFilesIn(full);
    return entry.endsWith(".ts") && !entry.endsWith(".test.ts") ? [full] : [];
  });
}

function importSpecifiers(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]!);
}

describe("architecture", () => {
  const domainFiles = sourceFilesIn(join(SRC, "domain"));

  it("should find domain source files to check", () => {
    expect(domainFiles.length).toBeGreaterThan(10);
  });

  it("should never import adapters, presets or errors from domain", () => {
    const offenders = domainFiles.filter((file) =>
      importSpecifiers(file).some((specifier) => /adapters|presets|errors/.test(specifier)),
    );

    expect(offenders).toEqual([]);
  });

  it("should never import a web framework anywhere in the package", () => {
    const offenders = sourceFilesIn(SRC).filter((file) =>
      importSpecifiers(file).some((specifier) => WEB_FRAMEWORKS.includes(specifier)),
    );

    expect(offenders).toEqual([]);
  });

  it("should declare no runtime dependencies", () => {
    const manifest = JSON.parse(readFileSync(join(SRC, "..", "package.json"), "utf8"));

    expect(manifest.dependencies).toBeUndefined();
  });
});
