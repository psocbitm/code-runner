import { CPU_LIMIT, MEMORY_LIMIT } from '../config/constants.js'
import { LANGUAGE_CONFIG } from '../config/languageConfig.js'

export function buildDockerCommand(language, code) {
  const config = LANGUAGE_CONFIG[language]
  const securityFlags = ['--rm', `--memory=${MEMORY_LIMIT}`, `--cpus=${CPU_LIMIT}`, '--network=none', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--read-only', '--pids-limit=100']

  return ['docker', 'run', ...securityFlags, config.image, config.cmd(code)].join(' ')
}
