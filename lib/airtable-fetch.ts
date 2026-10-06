import "server-only";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.message === "fetch failed") return true;
  const cause = (err as Error & { cause?: { code?: string; name?: string } }).cause;
  if (!cause) return false;
  return (
    cause.code === "UND_ERR_CONNECT_TIMEOUT" ||
    cause.code === "ETIMEDOUT" ||
    cause.code === "ECONNRESET" ||
    cause.code === "ENOTFOUND" ||
    cause.name === "ConnectTimeoutError"
  );
}

/** User-facing French message for outbound Airtable network failures. */
export function airtableNetworkErrorMessage(err: unknown): string {
  if (isTransientNetworkError(err)) {
    return "Impossible de joindre Airtable (délai dépassé). Vérifiez votre connexion internet et réessayez.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Erreur de communication avec Airtable. Réessayez.";
}

/**
 * fetch() to Airtable with short retries on connect timeouts / reset.
 * Node's default connect timeout (~10s) often surfaces as bare "fetch failed".
 */
export async function airtableFetch(
  url: string,
  init?: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastError = err;
      if (!isTransientNetworkError(err) || attempt === retries) break;
      console.warn(
        `[airtableFetch] transient network error (attempt ${attempt}/${retries})`,
        err
      );
      await sleep(800 * attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Impossible de joindre Airtable.");
}
