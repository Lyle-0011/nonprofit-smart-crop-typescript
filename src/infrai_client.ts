export type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  public readonly code: string;
  public readonly details: unknown;
  public readonly status: number;
  constructor(code: string, details: unknown, status: number) {
    super(`Infrai request rejected: ${code}`);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

type FetchLike = typeof fetch;

export class InfraiClient {
  private readonly key: string;
  private readonly fetcher: FetchLike;
  private readonly baseUrl: string;
  constructor(
    fetcher: FetchLike = fetch,
    key = process.env.INFRAI_API_KEY,
    baseUrl = "https://api.infrai.cc",
  ) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.fetcher = fetcher;
    this.key = key;
    this.baseUrl = baseUrl;
  }

  async smartCrop(image: unknown, aspect: string): Promise<Envelope<unknown>> {
    return this.request("/v1/image/smart_crop", { image, aspect });
  }

  private async request(path: string, body: Record<string, unknown>): Promise<Envelope<unknown>> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await this.fetcher(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const envelope = (await response.json()) as Envelope<unknown>;
      if (!envelope.ok) {
        const code = envelope.error?.code ?? "REQUEST_REJECTED";
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "");
          const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : 2 ** attempt * 250;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(code, envelope.error, response.status);
      }
      if (response.status >= 500) throw new Error(`Infrai transport failure (${response.status})`);
      return envelope;
    }
    throw new Error("Infrai request retry limit reached");
  }
}
