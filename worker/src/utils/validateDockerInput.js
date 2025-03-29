import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import { createExecutionError } from './createExecutionError.js'

export function validateInput(language, code, timeoutMs) {
  if (!language || typeof language !== 'string' || !language.trim()) {
    throw createExecutionError('Language must be a non-empty string')
  }
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw createExecutionError('Code must be a non-empty string')
  }
  if (timeoutMs !== undefined && (typeof timeoutMs !== 'number' || timeoutMs <= 0)) {
    throw createExecutionError('Timeout must be a positive number')
  }
  if (!LANGUAGE_CONFIG[language]) {
    throw createExecutionError(`Unsupported language: ${language}`, {
      supported: Object.keys(LANGUAGE_CONFIG),
    })
  }
}
