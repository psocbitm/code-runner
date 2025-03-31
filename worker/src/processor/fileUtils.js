import { rm } from 'fs/promises'
import logger from '../config/logger.js'

/**
 * Cleans up the temporary directory used for code execution
 * @param {string} tempDir - Path to the temporary directory
 * @param {string} executionId - The unique ID for this execution
 */
export async function cleanupTempDirectory(tempDir, executionId) {
  logger.info('Cleaning up temporary directory', { executionId, tempDir })
  try {
    await rm(tempDir, { recursive: true, force: true })
    logger.debug('Temporary directory successfully removed', { executionId, tempDir })
  } catch (cleanupError) {
    logger.warn('Failed to clean up temporary directory', {
      executionId,
      tempDir,
      errorMessage: cleanupError.message,
    })
  }
}