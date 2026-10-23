type PreparedRequest = { message: string; url: string };
type Clipboard = {
  writeText: (text: string) => Promise<void>;
  readText?: () => Promise<string>;
};

async function boundedClipboard<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error("Clipboard unavailable")),
          2000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// Each click fetches this order's current message. Nothing is cached across orders.
export async function copyCurrentReviewRequest(
  orderId: string,
  prepare: (orderId: string) => Promise<PreparedRequest>,
  clipboard: Clipboard | undefined,
  isCurrent: () => boolean = () => true,
) {
  const request = await prepare(orderId);
  if (!isCurrent()) return null;
  let copied = false;
  try {
    if (clipboard) {
      await boundedClipboard(clipboard.writeText(request.message));
      copied = clipboard.readText
        ? (await boundedClipboard(clipboard.readText())) === request.message
        : true;
    }
  } catch {
    // The exact prepared message remains available for manual copying.
  }
  return isCurrent() ? { ...request, copied } : null;
}
