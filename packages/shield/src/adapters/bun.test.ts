import { describe, expect, it } from "bun:test";
import { publicApiPreset } from "../presets";
import { withShieldBun } from "./bun";

const ok = () => new Response("ok");
const handler = withShieldBun(publicApiPreset)(ok);

/**
 * This wrapper *is* the fetch handler, so a block has to be a response. An
 * escaping throw would reach `Bun.serve` as a 500, not the documented 403.
 */
async function blockedBy(request: Request): Promise<{ status: number; reason: string }> {
  const response = await handler(request);
  return { status: response.status, reason: ((await response.json()) as { reason: string }).reason };
}

const BLOCKED = { status: 403, reason: "Request blocked by shield" };

describe("withShieldBun", () => {
  it("should call the wrapped handler when the request is clean", async () => {
    const response = await handler(new Request("https://api.tld/users?page=2"));

    expect(await response.text()).toBe("ok");
  });

  it("should answer 403 when the query string carries an attack", async () => {
    const request = new Request("https://api.tld/users?q=%27%20OR%201%3D1%20--");

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should answer 403 when a header carries an attack", async () => {
    const request = new Request("https://api.tld/users", {
      headers: { "x-file": "../../etc/passwd" },
    });

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should answer 403 when a JSON body carries an attack", async () => {
    const request = new Request("https://api.tld/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bio: "<script>alert(1)</script>" }),
    });

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should scan a text body as one string when it is not JSON", async () => {
    const request = new Request("https://api.tld/notes", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "'; DROP TABLE users--",
    });

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should scan a malformed JSON body as raw text rather than failing", async () => {
    const request = new Request("https://api.tld/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ not json <script>",
    });

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should scan multipart uploads including their leading bytes", async () => {
    const form = new FormData();
    form.append("avatar", new File([new Uint8Array([0x4d, 0x5a, 0x90])], "photo.png", {
      type: "image/png",
    }));
    const request = new Request("https://api.tld/upload", { method: "POST", body: form });

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should pass a clean multipart upload through", async () => {
    const form = new FormData();
    form.append("note", "hello");
    form.append("doc", new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], "a.pdf", {
      type: "application/pdf",
    }));
    const request = new Request("https://api.tld/upload", { method: "POST", body: form });

    expect(await (await handler(request)).text()).toBe("ok");
  });

  it("should keep every value of a repeated query parameter", async () => {
    // `Object.fromEntries` would keep only `safe` and wave the payload past.
    const request = new Request("https://api.tld/users?q=%3Cscript%3E&q=safe");

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should answer 403 on the declared length before buffering the body", async () => {
    const request = new Request("https://api.tld/upload", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "500000000" },
      body: JSON.stringify({ note: "clean" }),
    });

    expect(await blockedBy(request)).toEqual(BLOCKED);
  });

  it("should not read a body when the request has none", async () => {
    const request = new Request("https://api.tld/users", { method: "GET" });

    expect(await (await handler(request)).text()).toBe("ok");
  });
});
