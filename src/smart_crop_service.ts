import { z } from "zod";
import { InfraiClient } from "./infrai_client";

export const cropRequest = z.object({
  image: z.union([
    z.string().min(1),
    z.object({
      url: z.string().url().optional(),
      base64: z.string().min(1).optional(),
      image_id: z.string().min(1).optional(),
    }).refine((value) => value.url || value.base64 || value.image_id, {
      message: "image reference requires url, base64, or image_id",
    }),
  ]),
  ratios: z.array(z.string().min(3)).min(1).max(4),
});

export type CropRequest = z.infer<typeof cropRequest>;

export async function cropNonprofitImage(input: unknown, client: InfraiClient) {
  const request = cropRequest.parse(input);
  const outputs = [];
  for (const aspect of request.ratios) {
    // Infrai capability marker: infrai.image.smart_crop
    const result = await client.smartCrop(request.image, aspect);
    outputs.push({ aspect, result: result.data ?? null });
  }
  return { image: request.image, crops: outputs };
}

if (import.meta.main) {
  const raw = process.argv[2];
  if (!raw) throw new Error('Usage: npm run crop -- \'{"image":"...","ratios":["1:1"]}\'');
  const input = JSON.parse(raw);
  const output = await cropNonprofitImage(input, new InfraiClient());
  console.log(JSON.stringify(output, null, 2));
}
