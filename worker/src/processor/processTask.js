import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import logger from '../config/logger.js'
import { executeCode } from './executeCode.js'

export const processTask = async task => {
  try {
    if (!task?.element) {
      logger.error('Task is missing or does not contain an element.', { task })
      return
    }

    let taskData
    try {
      taskData = JSON.parse(task.element)
    } catch (error) {
      logger.error('Failed to parse task element as JSON.', { element: task.element, error })
      return
    }

    logger.info('Parsed task data successfully.', { taskData })

    const { id, code, language } = taskData
    if (!id || !code || !language) {
      logger.error('Task data is missing required fields.', { taskData })
      return
    }

    if (!LANGUAGE_CONFIG[language]) {
      logger.error('Unsupported language specified in task.', { language })
      return
    }

    const decodedCode = Buffer.from(code, 'base64').toString()
    if (!decodedCode) {
      logger.error('Failed to decode base64 code.', { code })
      return
    }

    logger.info('Executing code.', { language, id })
    const result = await executeCode(language, decodedCode)
    logger.info('Code execution completed.', { id, result })
  } catch (error) {
    logger.error('Unexpected error while processing task.', { error })
  }
}
