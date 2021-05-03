import test from "ava";
import { arrAvg } from "../src/modules/util";

test("arrAvg", (t) => {
  const testArr = [1, 2, 3, 4, 5];
  t.pass(arrAvg(testArr), 3);
});

// test("bar", async (t) => {
//   const bar = Promise.resolve("bar");
//   t.is(await bar, "bar");
// });
