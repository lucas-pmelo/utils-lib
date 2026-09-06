import { describe, expect, it } from "bun:test";
import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { publicApiPreset } from "../presets/index.js";
import { withShieldExpress } from "./express.js";

const middleware = withShieldExpress(publicApiPreset);

function nextSpy() {
  const calls: unknown[] = [];
  return { calls, next: (...args: unknown[]) => calls.push(args) };
}

describe("withShieldExpress", () => {
  it("should call next when every surface is clean", () => {
    const spy = nextSpy();

    middleware({ headers: {}, query: { page: "2" }, body: { name: "Ana" } }, {}, spy.next);

    expect(spy.calls).toHaveLength(1);
  });

  it("should call next when qs left a repeated parameter as an array", () => {
    const spy = nextSpy();

    // `?tags[]=a&tags[]=b`. Reading this as a string threw inside the walls,
    // and the fail-closed catch turned an ordinary request into a 403.
    middleware({ query: { tags: ["a", "b"], filter: { name: "Ana" } } }, {}, spy.next);

    expect(spy.calls).toHaveLength(1);
  });

  it("should throw ShieldBlockedError when the query carries an attack", () => {
    const spy = nextSpy();

    expect(() => middleware({ query: { q: "' OR 1=1 --" } }, {}, spy.next)).toThrow(ShieldBlockedError);
    expect(spy.calls).toHaveLength(0);
  });

  it("should scan multer uploads when they arrive as an array", () => {
    const req = {
      files: [{ originalname: "photo.png.exe", mimetype: "image/png", size: 10 }],
    };

    expect(() => middleware(req, {}, nextSpy().next)).toThrow(ShieldBlockedError);
  });

  it("should scan multer uploads when they arrive keyed by field name", () => {
    const req = {
      files: { avatar: [{ originalname: "../escape.png", mimetype: "image/png", size: 10 }] },
    };

    expect(() => middleware(req, {}, nextSpy().next)).toThrow(ShieldBlockedError);
  });

  it("should scan a single multer upload on req.file", () => {
    const req = { file: { originalname: "clean.png", mimetype: "image/png", size: 10 } };

    expect(() => middleware(req, {}, nextSpy().next)).not.toThrow();
  });

  it("should read the magic bytes when multer kept the buffer", () => {
    const req = {
      file: {
        originalname: "photo.png",
        mimetype: "image/png",
        size: 4,
        buffer: new Uint8Array([0x4d, 0x5a, 0x90, 0x00]),
      },
    };

    expect(() => middleware(req, {}, nextSpy().next)).toThrow(ShieldBlockedError);
  });
});
