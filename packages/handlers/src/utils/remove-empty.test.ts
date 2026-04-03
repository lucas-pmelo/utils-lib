import { removeEmpty } from "./remove-empty";
import { expect, test, describe } from "bun:test";

describe("Remove empty", () => {
  test("should return when data is not an object", () => {
    expect(removeEmpty("")).toEqual("");
  });

  test("should return when data is null", () => {
    expect(removeEmpty(null)).toBeNull();
  });

  test("should perform remove empty keys", () => {
    expect(
      removeEmpty({
        name: "dani",
        amount: null,
        address: {
          street: "",
          number: undefined,
          ctesty: "SP",
        },
      })
    ).toEqual({ address: { city: "SP" }, name: "dani" });
  });
});
