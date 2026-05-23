import { env } from '../config/env.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[35m', // Magenta
};

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = `${COLORS.dim}[${this.getTimestamp()}]${COLORS.reset}`;
    const levelColor = COLORS[level] || COLORS.reset;
    const formattedLevel = `${COLORS.bright}${levelColor}${level.toUpperCase()}${COLORS.reset}`;
    
    let metaStr = '';
    if (meta) {
      if (meta instanceof Error) {
        metaStr = `\n${COLORS.error}${meta.stack || meta.message}${COLORS.reset}`;
      } else {
        metaStr = ` \n${COLORS.dim}${JSON.stringify(meta, null, 2)}${COLORS.reset}`;
      }
    }
    
    return `${timestamp} ${formattedLevel}: ${message}${metaStr}`;
  }

  public info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  public error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  public debug(message: string, meta?: any): void {
    if (env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
