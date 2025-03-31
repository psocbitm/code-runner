import { exec } from 'child_process'
import { mkdtemp, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import { buildDockerCommand } from '../utils/buildDockerCommand.js'
import { DEFAULT_TIMEOUT_MS } from '../config/constants.js'
import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import logger from '../config/logger.js'
import { validateInput } from '../utils/validateInput.js'
import { handleExecutionError } from './errorHandler.js'
import { cleanupTempDirectory } from './fileUtils.js'

const execAsync = promisify(exec)

/**
 * Executes code in a Docker container.
 * @param {string} language - Programming language.
 * @param {string} code - Code to execute.
 * @param {number} [timeoutMs] - Execution timeout in milliseconds.
 * @returns {Promise<{ output: string, error: string, success: boolean }>} Execution result.
 */
export async function executeCode(language, code, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const executionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  logger.info('Starting code execution', { executionId, language, codeLength: code?.length, timeoutMs })

  try {
    validateInput(language, code, timeoutMs)

    const config = LANGUAGE_CONFIG[language]
    const effectiveTimeout = Math.min(timeoutMs, config.maxTimeoutMs || DEFAULT_TIMEOUT_MS)
    logger.debug('Execution parameters configured', {
      executionId,
      language,
      requestedTimeout: timeoutMs,
      effectiveTimeout,
      languageConfig: config.name || language,
    })

    const tempDir = await mkdtemp(path.join(os.tmpdir(), `exec-${language}-`))
    logger.info('Temporary directory created', { executionId, tempDir })

    try {
      const result = await executeInDocker(language, code, tempDir, effectiveTimeout, executionId, config)
      return result
    } catch (error) {
      return handleExecutionError(error, effectiveTimeout, executionId, language)
    } finally {
      await cleanupTempDirectory(tempDir, executionId)
    }
  } catch (validationError) {
    logger.error('Code execution failed during initialization', {
      executionId,
      language,
      errorMessage: validationError.message,
    })

    return {
      output: '',
      error: validationError.message,
      success: false,
      executionTime: 0,
    }
  }
}

/**
 * Executes the code in a Docker container
 * @private
 */
async function executeInDocker(language, code, tempDir, effectiveTimeout, executionId, config) {
  const fileName = language === 'java' ? 'Main.java' : `script.${config.extension}`
  const filePath = path.join(tempDir, fileName)
  logger.debug('Writing code to temporary file', { executionId, filePath, fileName })
  await writeFile(filePath, code, 'utf8')
  logger.debug('Code successfully written to file', { executionId, filePath })

  const dockerCommand = buildDockerCommand(language, tempDir, fileName)
  logger.debug('Docker execution command prepared', {
    executionId,
    command: dockerCommand.substring(0, 100) + (dockerCommand.length > 100 ? '...' : ''),
  })

  const startTime = Date.now()
  logger.info('Executing code in Docker container', { executionId, language, startTime: new Date(startTime).toISOString() })

  const { stdout, stderr } = await execAsync(dockerCommand, {
    timeout: effectiveTimeout,
    killSignal: 'SIGKILL',
    encoding: 'utf8',
  })

  const executionTime = Date.now() - startTime
  logger.info('Code execution completed successfully', {
    executionId,
    language,
    executionTime,
    outputLength: stdout?.length,
    errorLength: stderr?.length,
  })

  return {
    output: stdout,
    error: stderr,
    success: true,
    executionTime,
  }
}
