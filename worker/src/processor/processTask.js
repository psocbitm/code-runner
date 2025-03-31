import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import logger from '../config/logger.js'
import { executeCode } from './executeCode.js'

export const processTask = async task => {
  try {
    if (!task?.element) {
      throw new Error('Task is missing or lacks an element.')
    }

    let taskData
    try {
      taskData = JSON.parse(task.element)
      logger.info('Parsed task data successfully.')
      logger.debug('Task data:', taskData)
    } catch (error) {
      throw new Error(`Failed to parse task element as JSON: ${error.message}`)
    }

    const { id, code, language } = taskData
    logger.info('Processing task:', { id, language })
    logger.debug('Task code:', code)

    if (!id || !code || !language) {
      throw new Error('Task data missing required fields: id, code, or language.')
    }

    if (!LANGUAGE_CONFIG[language]) {
      throw new Error(`Unsupported language: ${language}`)
    }
    
    logger.info('Executing code...', { id, language })
    const result = await executeCode(language, code)
    logger.info('Code execution completed.', { id, result })
    return { success: true, result }
  } catch (error) {
    logger.error('Error processing task:', { error: error.message, task })
    return { success: false, error: error.message }
  }
}
