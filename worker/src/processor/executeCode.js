import { DEFAULT_TIMEOUT_MS } from '../config/constants.js'
import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import { buildDockerCommand } from '../utils/buildDockerCommand.js'
import { createExecutionError } from '../utils/createExecutionError.js'
import { validateInput } from '../utils/validateDockerInput.js'
import { exec } from 'child_process'
import { promisify } from 'util'

export const execAsync = promisify(exec)
export async function executeCode(language, code, timeoutMs = DEFAULT_TIMEOUT_MS) {
  validateInput(language, code, timeoutMs)
  const config = LANGUAGE_CONFIG[language]

  const effectiveTimeout = Math.min(timeoutMs, config.maxTimeoutMs || DEFAULT_TIMEOUT_MS)

  const dockerCommand = buildDockerCommand(language, code)

  try {
    const { stdout, stderr } = await execAsync(dockerCommand, {
      timeout: effectiveTimeout,
      killSignal: 'SIGKILL',
      encoding: 'utf8',
    })

    return {
      output: stdout,
      error: stderr,
      success: true,
    }
  } catch (error) {
    if (error.killed) {
      throw createExecutionError(`Execution timed out after ${effectiveTimeout}ms`)
    }
    throw createExecutionError('Execution failed', {
      stderr: error.stderr,
      stdout: error.stdout,
      code: error.code,
    })
  }
}
