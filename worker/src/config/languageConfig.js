export const LANGUAGE_CONFIG = {
  javascript: {
    image: 'node:23-alpine',
    cmd: code => `node -e ${JSON.stringify(code)}`,
    maxTimeoutMs: 10000,
  },
  python: {
    image: 'python:3.9-alpine',
    cmd: code => `python -c ${JSON.stringify(code)}`,
    maxTimeoutMs: 10000,
  },
}
