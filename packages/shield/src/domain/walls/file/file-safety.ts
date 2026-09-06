import type { FileDetector } from "../../detector";
import type { Finding, Limits, ScannedFile } from "../../models";
import { detectMimeFromMagic } from "./magic-bytes";
import { isMimeCompatible } from "./mime-compat";
import { isUnsafeFilename } from "./filename";

const ID = "file-safety";

function finding(path: string, sample: string): Finding {
  return { wallId: ID, severity: "high", surface: "file", path, sample };
}

/**
 * Metadata-only upload checks: count, size, filename shape, and whether the
 * leading bytes agree with the declared type.
 *
 * Deliberately never inspects file content — malware scanning and sandboxing
 * are an antivirus job and an explicit non-goal.
 */
export const fileSafetyWall: FileDetector = {
  kind: "file",
  id: ID,
  severity: "high",
  inspect: (file: ScannedFile, index: number, limits: Limits): Finding[] | null => {
    const findings: Finding[] = [];

    if (index >= limits.maxFiles) {
      findings.push(finding(`file[${index}]`, `more than ${limits.maxFiles} files`));
    }

    if (file.size > limits.maxFileBytes) {
      findings.push(finding(`file[${index}].size`, `${file.size} > ${limits.maxFileBytes}`));
    }

    if (isUnsafeFilename(file.filename)) {
      findings.push(finding(`file[${index}].filename`, "unsafe filename"));
    }

    const actualMimeType = file.head && detectMimeFromMagic(file.head);
    if (actualMimeType && file.mimeType && !isMimeCompatible(file.mimeType, actualMimeType)) {
      findings.push(
        finding(`file[${index}].mimeType`, `declared ${file.mimeType}, looks like ${actualMimeType}`),
      );
    }

    return findings.length ? findings : null;
  },
};
