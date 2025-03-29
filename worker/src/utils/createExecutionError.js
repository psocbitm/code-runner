import logger from "../config/logger.js"

export function createExecutionError(message, details = {}) {
  const error = new Error(message);
  error.name = 'ExecutionError';
  error.details = details;
  logger.error(`ExecutionError: ${message}`, { details });
  return error;
}
