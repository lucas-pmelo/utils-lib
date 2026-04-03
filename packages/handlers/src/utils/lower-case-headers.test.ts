import { lowerCaseHeaders } from "./lower-case-headers";
import { expect, test, describe } from "bun:test";

describe("Lower case headers", () => {
  test("should transform lower case headers", () => {
    expect(
      lowerCaseHeaders({
        Accept: ["application/json"],
        "Accept-Encoding": "utf8",
        "x-user-id": "123",
      })
    ).toEqual({
      accept: "application/json",
      "accept-encoding": "utf8",
      "x-user-id": "123",
    });
  });
});
