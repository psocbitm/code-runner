import { CPU_LIMIT, MEMORY_LIMIT } from '../config/constants.js'
import { LANGUAGE_CONFIG } from '../config/languageConfig.js'
import logger from '../config/logger.js'

export function buildDockerCommand(language, tempDir, fileName) {
  logger.info('Building Docker command', { language, tempDir, fileName })
  const config = LANGUAGE_CONFIG[language]
  const mountPath = '/workspace'

  const cmd = config.cmd.replace(/{{MOUNT_PATH}}/g, mountPath).replace(/{{FILENAME}}/g, fileName)
  logger.debug('Command after placeholder replacement', { cmd })

  if (cmd.includes('{{MOUNT_PATH}}') || cmd.includes('{{FILENAME}}')) {
    logger.error('Failed to replace all placeholders in command', { language })
    throw new Error(`Failed to replace all placeholders in command for language: ${language}`)
  }

  const securityFlags = ['--rm', '--init', `--memory=${MEMORY_LIMIT}`, `--cpus=${CPU_LIMIT}`, '--network=none', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--pids-limit=100', `-v ${tempDir}:${mountPath}`]
  const dockerCommand = ['docker', 'run', ...securityFlags, config.image, cmd].join(' ')
  logger.debug('Final Docker command', { dockerCommand })

  return dockerCommand
}
