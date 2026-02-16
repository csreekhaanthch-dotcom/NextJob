type LogMeta = Record<string, unknown>;

type LogPayload = {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  meta?: LogMeta;
};

function formatLog(level: LogPayload['level'], message: string, meta?: LogMeta): string {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {})
  };

  return JSON.stringify(payload);
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(formatLog('info', message, meta));
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(formatLog('warn', message, meta));
  },
  error(message: string, meta?: LogMeta) {
    console.error(formatLog('error', message, meta));
  }
};
