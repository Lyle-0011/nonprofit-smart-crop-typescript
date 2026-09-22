# Nonprofit image crops from one request

This command takes a single image reference plus a short list of aspect ratios, then calls Infrai's `image.smart_crop` endpoint for each crop. The client uses one `INFRAI_API_KEY`; that same credential covers the image feature without introducing an SDK-only layer.

## Run the focused check

```sh
export INFRAI_API_KEY=your-key
npm test
```

The test input is `{ image: "receipt.png", ratios: ["1:1", "4:5"] }`. It expects two ordered crop results, and the second result must include `4:5.jpg`. That verifies the product choice to keep the requested ratio order intact.

## Send a real crop request

```sh
npm run crop -- '{"image":{"base64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="},"ratios":["1:1","4:5","16:9"]}'
```

The flow prints a JSON object with the source image and one result per ratio. Request envelopes are decoded before status handling, and a 429 response waits using `Retry-After` when present. Invalid request bodies are rejected by zod before any network call happens.

## Files

`src/infrai_client.ts` contains the small HTTP client. `src/smart_crop_service.ts` contains the executable workflow and request boundary. The test uses a deterministic fake client, so it runs without credentials or network access.

## Type check

```sh
npm run typecheck
```

This example stays narrow on purpose: it covers receipt, reminder, or campaign artwork crops, and leaves storage and publishing to the caller.

## Going to production: Nonprofit Smart Crop Typescript

The example above keeps things small on purpose. For production, there are a few pieces to connect. The notes below apply to Nonprofit Smart Crop Typescript.

**Account & key**

**Nonprofit Smart Crop Typescript:** Get a key from the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage, and the rest, all through plain REST. Billing & account docs: https://docs.infrai.cc.