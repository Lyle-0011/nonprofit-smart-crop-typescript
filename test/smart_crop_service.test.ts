import assert from "node:assert/strict";
import { cropNonprofitImage } from "../src/smart_crop_service";

const calls: Array<Record<string, unknown>> = [];
const client = { smartCrop: async (image: string, aspect: string) => {
  calls.push({ image, aspect });
  return { ok: true, data: { url: `${aspect}.jpg` } };
} } as any;

const result = await cropNonprofitImage({ image: "receipt.png", ratios: ["1:1", "4:5"] }, client);
assert.deepEqual(calls, [
  { image: "receipt.png", aspect: "1:1" },
  { image: "receipt.png", aspect: "4:5" },
]);
assert.equal(result.crops[1].result.url, "4:5.jpg");
console.log("smart crop decision verified");
