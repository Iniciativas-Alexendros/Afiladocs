// Structured logging helper — patrón del proyecto según CLAUDE.md:
// `console.log(JSON.stringify({event, ...data, ts}))` en API routes y webhooks.
// Centralizar evita drift de formato y hace trivial migrar a un drain externo.

type LogData = Record<string, unknown>

function emit(level: 'info' | 'warn' | 'error', event: string, data: LogData) {
  const payload = JSON.stringify({ event, ...data, ts: new Date().toISOString() })
  if (level === 'error') console.error(payload)
  else if (level === 'warn') console.warn(payload)
  else console.log(payload)
}

export const logEvent = {
  info: (event: string, data: LogData = {}) => emit('info', event, data),
  warn: (event: string, data: LogData = {}) => emit('warn', event, data),
  error: (event: string, data: LogData = {}) => emit('error', event, data),
}
