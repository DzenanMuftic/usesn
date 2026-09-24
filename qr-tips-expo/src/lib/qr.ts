export type TipPayload = {
  userId: string;
  displayName: string;
  handle: string;
};

const SCHEME = 'qrtips';

export function encodeTipQr(payload: TipPayload): string {
  const params = new URLSearchParams({
    name: payload.displayName,
    handle: payload.handle,
  });
  return `${SCHEME}://tip/${payload.userId}?${params.toString()}`;
}

export function decodeTipQr(raw: string): TipPayload | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== `${SCHEME}:`) return null;
    const userId = url.pathname.replace(/^\/+/, '') || url.hostname;
    if (!userId) return null;
    const displayName = url.searchParams.get('name') ?? 'Someone';
    const handle = url.searchParams.get('handle') ?? userId.slice(0, 8);
    return { userId, displayName, handle };
  } catch {
    return null;
  }
}
