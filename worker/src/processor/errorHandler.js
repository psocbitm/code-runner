import logger from '../config/logger.js'

/**
 * Handles errors that occur during code execution
 * @param {Error} error - The error that occurred
 * @param {number} effectiveTimeout - The timeout used for execution
 * @param {string} executionId - The unique ID for this execution
 * @param {string} language - The programming language being executed
 * @returns {Object} Standardized error response
 */
export function handleExecutionError(error, effectiveTimeout, executionId, language) {
  const executionTime = Date.now() - error.startTime || 0

  if (error.killed) {
    logger.error('Code execution timed out', {
      executionId,
      language,
      timeout: effectiveTimeout,
      executionTime,
      signal: error.signal,
    })
    return {
      output: error.stdout || '',
      error: `Execution timed out after ${effectiveTimeout}ms`,
      success: false,
      executionTime,
    }
  }

  if (error.signal === 'SIGKILL') {
    logger.error('Code execution forcibly terminated', {
      executionId,
      language,
      signal: error.signal,
      executionTime,
    })
    return {
      output: error.stdout || '',
      error: 'Execution terminated by system',
      success: false,
      executionTime,
    }
  }

  logger.error('Code execution failed with error', {
    executionId,
    language,
    errorMessage: error.message,
    errorCode: error.code,
    executionTime,
  })

  return {
    output: error.stdout || '',
    error: error.stderr || error.message,
    success: false,
    executionTime,
  }
}
