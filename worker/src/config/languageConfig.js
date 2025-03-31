/**
 * Configuration for supported languages.
 * Commands use {{MOUNT_PATH}} and {{FILENAME}} placeholders.
 */
export const LANGUAGE_CONFIG = {
  javascript: {
    image: 'node:slim',
    cmd: 'node {{MOUNT_PATH}}/{{FILENAME}}',
    extension: 'js',
    maxTimeoutMs: 10000,
  },
  python: {
    image: 'python:slim',
    cmd: 'python {{MOUNT_PATH}}/{{FILENAME}}',
    extension: 'py',
    maxTimeoutMs: 10000,
  },
  cpp: {
    image: 'cpp-alpine',
    cmd: 'sh -c "g++ {{MOUNT_PATH}}/{{FILENAME}} -o {{MOUNT_PATH}}/script.out && {{MOUNT_PATH}}/script.out"',
    extension: 'cpp',
    maxTimeoutMs: 15000,
  },
  java: {
    image: 'amazoncorretto:24-alpine',
    cmd: 'sh -c "javac {{MOUNT_PATH}}/Main.java && java -cp {{MOUNT_PATH}} Main"',
    extension: 'java',
    maxTimeoutMs: 15000,
  },
}
