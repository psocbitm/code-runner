import { createClient } from 'redis'
import logger from './logger.js'

export const connectRedis = async () => {
  logger.info('Connecting to Redis...')
  const client = createClient()
  client.on('error', err => {
    logger.error('Redis error: ', err)
  })
  client.on('connect', () => {
    logger.info('Connected to Redis')
  })
  await client.connect()
  return client
}
