export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

export class GameLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private enabled: boolean = true;
  private minLevel: LogLevel = LogLevel.INFO;

  private levelOrder: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  log(category: string, message: string, data?: any, level: LogLevel = LogLevel.INFO): void {
    if (!this.enabled) return;
    if (this.levelOrder[level] < this.levelOrder[this.minLevel]) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (level === LogLevel.ERROR) {
      console.error(`[${category}] ${message}`, data || '');
    } else if (level === LogLevel.WARN) {
      console.warn(`[${category}] ${message}`, data || '');
    } else {
      console.log(`[${category}] ${message}`, data || '');
    }
  }

  debug(category: string, message: string, data?: any): void {
    this.log(category, message, data, LogLevel.DEBUG);
  }

  info(category: string, message: string, data?: any): void {
    this.log(category, message, data, LogLevel.INFO);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(category, message, data, LogLevel.WARN);
  }

  error(category: string, message: string, data?: any): void {
    this.log(category, message, data, LogLevel.ERROR);
  }

  getLogs(category?: string, level?: LogLevel): LogEntry[] {
    return this.logs.filter((log) => {
      if (category && log.category !== category) return false;
      if (level && log.level !== level) return false;
      return true;
    });
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  clear(): void {
    this.logs = [];
  }

  getStats() {
    const counts: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
    };

    for (const log of this.logs) {
      counts[log.level]++;
    }

    return {
      total: this.logs.length,
      byLevel: counts,
    };
  }

  exportToJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}
