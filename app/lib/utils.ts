/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function safeParseJSON<T>(
  value: string
): { data?: T; error?: string } {
  try {
    return { data: JSON.parse(value) as T };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown JSON parse error";
    return { error: message };
  }
}

export const now = () => Date.now();

export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.info("[Resumind]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.warn("[Resumind]", ...args);
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.error("[Resumind]", ...args);
  },
};

