type LogContext = Record<string, unknown> | undefined;

const redactContext = (context: LogContext): Record<string, string> | undefined => {
  if (!context) {
    return undefined;
  }

  return Object.keys(context).reduce<Record<string, string>>((acc, key) => {
    acc[key] = '[redacted]';
    return acc;
  }, {});
};

export const logError = (message: string, context?: LogContext) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (import.meta.env.MODE !== 'production') {
    console.error(`ProviderNotesError: ${message}`, redactContext(context));
  }
};
