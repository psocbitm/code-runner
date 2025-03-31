import { exec } from 'child_process'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import { buildDockerCommand } from '../utils/buildDockerCommand.js'
import { DEFAULT_TIMEOUT_MS } from '../config/constants.js'
import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import logger from '../config/logger.js'

const execAsync = promisify(exec)

function validateInput(language, code, timeoutMs) {
  logger.debug('Validating inputs', { language, timeoutMs })
  if (!LANGUAGE_CONFIG[language]) throw new Error(`Unsupported language: ${language}`)
  if (typeof code !== 'string' || code.trim() === '') throw new Error('Code must be a non-empty string')
  if (typeof timeoutMs !== 'number' || timeoutMs <= 0) throw new Error('Timeout must be a positive number')
}

/**
 * Executes code in a Docker container.
 * @param {string} language - Programming language.
 * @param {string} code - Code to execute.
 * @param {number} [timeoutMs] - Execution timeout in milliseconds.
 * @returns {Promise<{ output: string, error: string, success: boolean }>} Execution result.
 */
export async function executeCode(language, code, timeoutMs = DEFAULT_TIMEOUT_MS) {
  logger.info('Starting code execution', { language, timeoutMs })
  validateInput(language, code, timeoutMs)
  const config = LANGUAGE_CONFIG[language]
  const effectiveTimeout = Math.max(timeoutMs, config.maxTimeoutMs || DEFAULT_TIMEOUT_MS)
  logger.debug('Effective timeout calculated', { effectiveTimeout })

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'task-'))
  logger.info('Temporary directory created', { tempDir })
  try {
    const fileName = language === 'java' ? 'Main.java' : `script.${config.extension}`
    const filePath = path.join(tempDir, fileName)
    logger.debug('Writing code to file', { filePath })
    await writeFile(filePath, code, 'utf8')

    const dockerCommand = buildDockerCommand(language, tempDir, fileName)
    logger.debug('Docker command built', { dockerCommand })
    const { stdout, stderr } = await execAsync(dockerCommand, {
      timeout: effectiveTimeout,
      killSignal: 'SIGKILL',
      encoding: 'utf8',
    })
    logger.info('Execution completed', { stdout, stderr })

    return { output: stdout, error: stderr, success: true }
  } catch (error) {
    if (error.killed) {
      logger.error('Execution timed out', { effectiveTimeout })
      throw new Error(`Execution timed out after ${effectiveTimeout}ms`)
    }
    logger.error('Execution failed', { error: error.message })
    throw new Error(`Execution failed: ${error.message}`)
  } finally {
    logger.info('Cleaning up temporary directory', { tempDir })
    await rm(tempDir, { recursive: true, force: true }).catch(() => {
      logger.warn('Failed to clean up temporary directory', { tempDir })
    })
  }
}
