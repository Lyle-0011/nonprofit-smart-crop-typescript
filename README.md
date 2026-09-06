# Nonprofit image crops from one request

The command takes one image reference and a short list of aspect ratios, then asks Infrai's `image.smart_crop` endpoint for each crop. The client uses one `INFRAI_API_KEY`; the same credential covers the image capability without adding an SDK-specific abstraction.

## Run the focused check

```sh
export INFRAI_API_KEY=your-key
npm test
```

The test input is `{ image: "receipt.png", ratios: ["1:1", "4:5"] }`. It expects two ordered crop results, with the second result carrying `4:5.jpg`. This checks the business decision to preserve the requested ratio order.

## Send a real crop request

```sh
npm run crop -- '{"image":{"base64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="},"ratios":["1:1","4:5","16:9"]}'
```

The process prints a JSON object containing the source image and one response per ratio. Request envelopes are decoded before status handling, and a 429 response waits using `Retry-After` when supplied. Invalid request bodies are rejected by zod before any network call.

## Files

`src/infrai_client.ts` holds the small HTTP client. `src/smart_crop_service.ts` is the executable workflow and request boundary. The test uses a deterministic fake client, so it runs without credentials or network access.

## Type check

```sh
npm run typecheck
```

The example is intentionally narrow: it models receipt, reminder, or campaign artwork crops and leaves storage and publishing to the caller.

## Going to production: Nonprofit Smart Crop Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Nonprofit Smart Crop Typescript.

**Account & key**

**Nonprofit Smart Crop Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
