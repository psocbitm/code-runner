// logger.js
import winston from 'winston'
import path from 'path'

// Define custom colors for different log levels
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'cyan',
}

winston.addColors(customColors)

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const metaString = Object.keys(metadata).length ? ' ' + JSON.stringify(metadata, null, 2) : ''
    return `[${timestamp}] ${level}: ${message}${metaString}`
  }),
)

// Format for file output (JSON)
const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json())

// Base transport configuration
const transportOptions = {
  errorFile: {
    level: 'error',
    filename: path.join('logs', 'error.log'),
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  combinedFile: {
    level: 'info',
    filename: path.join('logs', 'combined.log'),
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  console: {
    level: 'debug',
    format: consoleFormat,
    handleExceptions: true,
  },
}

// Initialize transports array
const transports = [new winston.transports.File(transportOptions.errorFile), new winston.transports.File(transportOptions.combinedFile)]

// Add console transport only in development
if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console(transportOptions.console))
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  format: fileFormat,
  transports,
  exitOnError: false,
})

export default logger
