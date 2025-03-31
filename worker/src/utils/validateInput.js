import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import logger from '../config/logger.js'

export function validateInput(language, code, timeoutMs) {
  logger.debug('Validating execution inputs', { language, codeLength: code?.length, timeoutMs })

  if (!LANGUAGE_CONFIG[language]) {
    logger.error('Unsupported language requested', { language, availableLanguages: Object.keys(LANGUAGE_CONFIG) })
    throw new Error(`Unsupported language: ${language}`)
  }

  if (typeof code !== 'string' || code.trim() === '') {
    logger.error('Invalid code provided', { codeType: typeof code, isEmpty: code?.trim() === '' })
    throw new Error('Code must be a non-empty string')
  }

  if (typeof timeoutMs !== 'number' || timeoutMs <= 0) {
    logger.error('Invalid timeout value', { timeoutMs, type: typeof timeoutMs })
    throw new Error('Timeout must be a positive number')
  }

  logger.debug('Input validation successful', { language })
}
