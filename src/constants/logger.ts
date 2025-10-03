/**
 * Logging utility for LumiOS that formats log messages with styled labels
 * and includes the file and line number where the log was triggered.
 */
class Logger {
  /**
   * Prints a styled inline log message.
   *
   * @param type - The log type (e.g. 'info', 'error', 'debug')
   * @param color - The background color for the type label
   * @param msg - The message to log
   */
  private styledHeaderInline(type: string, color: string, msg: string): void {
    const location = this.getCallerLocation();

    console.log(
      `%cLumiOS %c${type.toUpperCase()} %c${msg} %c@ ${location}`,
      'padding:2px 8px;color:white;background:#363a4f;border-radius:8px 0 0 8px;',
      `padding:2px 8px;color:white;background:${color};border-radius:0 8px 8px 0;margin-right:4px;`,
      'color:#aaa;',
      'color:#888;font-size:10px;'
    );
  }

  /**
   * Extracts the file and line number of the function that called the logger.
   *
   * @returns A formatted string with file path and line:column (e.g. App.tsx:42:5)
   */
  private getCallerLocation(): string {
    const err = new Error();
    if (!err.stack) return 'unknown';

    const stackLines = err.stack.split('\n');

    // Skip lines: [0] Error, [1] this func, [2] styledHeaderInline, [3] info|error|...
    const callerLine = stackLines[4] || stackLines[3];
    const match = callerLine?.match(/(?:\()?(\/[^)]+):(\d+):(\d+)\)?$/);

    if (match) {
      const [, file, line, col] = match;
      const filename = file.split('/').pop();
      return `${filename}:${line}:${col}`;
    }

    return 'unknown';
  }

  /**
   * Logs an info-level message.
   *
   * @param msg - Message to log
   */
  info(msg: string): void {
    this.styledHeaderInline('info', '#8aadf4', msg);
  }

  /**
   * Logs an error-level message.
   *
   * @param msg - Error message to log
   */
  error(msg: string): void {
    this.styledHeaderInline('error', '#ed8796', msg);
  }

  /**
   * Logs a success-level message.
   *
   * @param msg - Success message to log
   */
  success(msg: string): void {
    this.styledHeaderInline('success', '#a6da95', msg);
  }

  /**
   * Logs a debug-level message.
   *
   * @param msg - Debug message to log
   */
  debug(msg: string): void {
    this.styledHeaderInline('debug', '#c6a0f6', msg);
  }
}

/**
 * Global logger instance for use across LumiOS.
 *
 * Use `logger.info(...)`, `logger.error(...)`, etc. to log structured messages.
 */
const logger = new Logger();
export default logger;