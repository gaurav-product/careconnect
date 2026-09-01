export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
  status: number;
}

export class RequestError extends Error implements ApiError {
  error: string;
  details?: Record<string, string[]>;
  status: number;
  constructor(body: Partial<ApiError>, status: number) {
    super(body.message || 'Something went wrong. Please try again.');
    this.error = body.error || 'error';
    this.details = body.details;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
      ...init
    });
  } catch {
    throw new RequestError(
      { error: 'network', message: 'You appear to be offline. Check your connection and try again.' },
      0
    );
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const body = text ? safeParse(text) : {};
  if (!res.ok) throw new RequestError(body, res.status);
  return body as T;
}

function safeParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { message: 'The server sent an unexpected response.' };
  }
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(p: string, body: unknown) => request<T>(p, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(p: string) => request<T>(p, { method: 'DELETE' })
};
