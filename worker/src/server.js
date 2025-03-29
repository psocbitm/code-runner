import { connectRedis } from './config/connectRedis.js'
import logger from './config/logger.js'
import { processTask } from './processor/processTask.js'
const QUEUE_NAME = 'tasks'
export const startWorker = async () => {
  try {
    logger.info('Starting worker...')
    const redis = await connectRedis()
    while (true) {
      const task = await redis.BRPOP(QUEUE_NAME, 0)
      if (task) {
        logger.info('Received task: ', task)
        processTask(task)
      }
    }
  } catch (error) {
    logger.error('Error starting worker: ', error)
    process.exit(1)
  }
}
